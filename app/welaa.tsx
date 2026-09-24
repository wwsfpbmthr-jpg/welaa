'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Plus, Search, Compass, CalendarDays, UserRound, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Toaster, toast } from 'sonner';
import { AppContext } from './context';
import { AppData, Space, initial, coordinates, datePlus, today } from './data';
import { Logo } from './ui';
import { Home, SearchPage, HowItWorks } from './views';
import { Detail } from './detail';
import { Wizard } from './wizard';
import { Account, HostCalendar } from './account';
import { supabase } from '@/lib/supabase/client';

function imageUrl(path?: string) {
  if (!path) return '/favicon.svg';
  if (/^https?:\/\//i.test(path)) return path;
  return supabase.storage.from('listing-images').getPublicUrl(path).data.publicUrl;
}

function mapListing(row: any): Space {
  const [lat, lng] = coordinates(row.city);
  const images = (row.image_paths ?? []).map((path: string) => imageUrl(path));
  return {
    id: row.id,
    name: row.title,
    type: row.type,
    area: row.area,
    city: row.city,
    price: row.hourly_price,
    guests: row.guest_limit,
    rating: 0,
    reviews: 0,
    image: images[0] ?? '/favicon.svg',
    images,
    activities: row.activities ?? [],
    amenities: row.amenities ?? [],
    description: row.description ?? '',
    host: row.host_display_name,
    distance: 0,
    lat: row.approximate_latitude ?? lat,
    lng: row.approximate_longitude ?? lng,
    open: row.open_hour,
    close: row.close_hour,
    instant: false,
    owner: row.owner_id,
    rules: row.rules ?? '',
  };
}

export default function Welaa() {
  const path = usePathname() || '/';
  const router = useRouter();
  const [data, setData] = useState<AppData>(initial);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [register, setRegister] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const refresh = useCallback(async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const authResult = sessionData.session ? await supabase.auth.getUser() : null;
      if (authResult?.error) throw authResult.error;
      const user = authResult?.data.user ?? null;

      let profile: any = null;
      if (user) {
        const result = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (result.error) throw result.error;
        profile = result.data;
      }

      let listingQuery = supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (user) listingQuery = listingQuery.or(`status.eq.published,owner_id.eq.${user.id}`);
      else listingQuery = listingQuery.eq('status', 'published');
      const listingResult = await listingQuery;
      if (listingResult.error) throw listingResult.error;
      const listingRows = listingResult.data ?? [];
      const ids = listingRows.map((row) => row.id);

      let availabilityRows: any[] = [];
      if (ids.length) {
        const result = await supabase
          .from('availability')
          .select('listing_id,available_date,hour,hourly_price,is_open')
          .in('listing_id', ids)
          .gte('available_date', today())
          .lte('available_date', datePlus(180));
        if (result.error) throw result.error;
        availabilityRows = result.data ?? [];
      }

      let bookingRows: any[] = [];
      let favoriteRows: any[] = [];
      if (user) {
        const [bookingsResult, favoritesResult] = await Promise.all([
          supabase.from('bookings').select('*').order('created_at', { ascending: false }),
          supabase.from('favorites').select('listing_id'),
        ]);
        if (bookingsResult.error) throw bookingsResult.error;
        if (favoritesResult.error) throw favoritesResult.error;
        bookingRows = bookingsResult.data ?? [];
        favoriteRows = favoritesResult.data ?? [];
      }

      const mappedBookings = bookingRows.map((row) => ({
        id: row.id,
        space_id: row.listing_id,
        user_id: row.renter_id,
        date: row.booking_date,
        start: row.start_hour,
        end: row.end_hour,
        guests: row.guest_count,
        subtotal: row.subtotal,
        fee: row.service_fee,
        total: row.total,
        status: row.status,
        created_at: row.created_at,
      }));
      const occupied = mappedBookings
        .filter((booking) => booking.status === 'pending' || booking.status === 'confirmed')
        .flatMap((booking) =>
          Array.from({ length: booking.end - booking.start }, (_, i) => ({
            space_id: booking.space_id,
            date: booking.date,
            hour: booking.start + i,
            kind: 'booked',
            booking_id: booking.id,
          })),
        );

      const nextData: AppData = {
        user: user
          ? {
              id: user.id,
              email: user.email ?? '',
              name: profile?.display_name ?? user.user_metadata?.display_name ?? user.email?.split('@')[0] ?? 'สมาชิก',
              phone: profile?.phone_number ?? '',
              bio: profile?.bio ?? '',
            }
          : null,
        spaces: listingRows.map(mapListing),
        occupied,
        availability: availabilityRows.map((row) => ({
          space_id: row.listing_id,
          date: row.available_date,
          hour: row.hour,
          price: row.hourly_price,
          is_open: row.is_open,
        })),
        bookings: mappedBookings,
        favorites: favoriteRows.map((row) => row.listing_id),
        messages: [],
        reviews: [],
        draft: typeof window === 'undefined' ? null : JSON.parse(window.localStorage.getItem('welaa-draft') || 'null'),
      };
      setData(nextData);
      setError('');
    } catch (e: any) {
      const message = e?.message || 'โหลดข้อมูลไม่สำเร็จ';
      if (e?.name === 'AuthSessionMissingError' || /auth session missing/i.test(message)) {
        setData((current) => ({ ...current, user: null }));
        setError('');
      } else {
        setError(message);
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60000);
    const { data: authState } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void refresh(), 0);
    });
    return () => {
      window.clearInterval(timer);
      authState.subscription.unsubscribe();
    };
  }, [refresh]);

  const auth = (v = false) => {
    setRegister(v);
    setAuthMessage('');
    setAuthOpen(true);
  };
  const go = (destination: string) => router.push(destination);

  const act = async (body: any) => {
    if (!data.user) {
      auth();
      return null;
    }
    setBusy(true);
    try {
      let result: any = true;
      if (body.action === 'draft') {
        window.localStorage.setItem('welaa-draft', JSON.stringify(body.data));
        return true;
      }
      if (body.action === 'favorite') {
        if (body.saved) {
          const { error } = await supabase.from('favorites').upsert(
            { user_id: data.user.id, listing_id: body.spaceId },
            { onConflict: 'user_id,listing_id' },
          );
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', data.user.id)
            .eq('listing_id', body.spaceId);
          if (error) throw error;
        }
      } else if (body.action === 'publish') {
        const draft = body.data;
        const { data: listing, error } = await supabase
          .from('listings')
          .insert({
            owner_id: data.user.id,
            title: draft.name,
            type: draft.type,
            area: draft.area,
            city: draft.city,
            description: draft.description,
            rules: draft.rules,
            guest_limit: draft.guests,
            hourly_price: draft.price,
            open_hour: draft.open,
            close_hour: draft.close,
            activities: draft.activities,
            amenities: draft.amenities,
            image_paths: draft.images,
            host_display_name: draft.host || data.user.name,
            status: 'published',
          })
          .select('id')
          .single();
        if (error) throw error;

        const hours = Array.from({ length: draft.close - draft.open }, (_, i) => draft.open + i);
        const schedule = await supabase.rpc('manage_listing_availability', {
          p_listing_id: listing.id,
          p_date: draft.date,
          p_hours: hours,
          p_hourly_price: draft.price,
          p_mode: 'open',
        });
        if (schedule.error) {
          await supabase.from('listings').delete().eq('id', listing.id);
          throw schedule.error;
        }
        window.localStorage.removeItem('welaa-draft');
        result = { id: listing.id };
      } else if (body.action === 'book') {
        const { data: bookingId, error } = await supabase.rpc('request_booking', {
          p_listing_id: body.spaceId,
          p_date: body.date,
          p_start_hour: body.start,
          p_end_hour: body.end,
          p_guest_count: body.guests,
        });
        if (error) throw error;
        result = { id: bookingId };
      } else if (body.action === 'cancel') {
        const { error } = await supabase.rpc('cancel_booking', { p_booking_id: body.id });
        if (error) throw error;
      } else if (body.action === 'respond') {
        const { error } = await supabase.rpc('respond_to_booking', {
          p_booking_id: body.id,
          p_accept: body.accept,
        });
        if (error) throw error;
      } else if (body.action === 'slots') {
        const { error } = await supabase.rpc('manage_listing_availability', {
          p_listing_id: body.spaceId,
          p_date: body.date,
          p_hours: body.hours,
          p_hourly_price: Number(body.price),
          p_mode: body.mode === 'block' ? 'block' : 'open',
        });
        if (error) throw error;
      } else if (body.action === 'profile') {
        const { error } = await supabase.from('profiles').update({
          display_name: body.name,
          phone_number: body.phone,
          bio: body.bio,
        }).eq('id', data.user.id);
        if (error) throw error;
      } else if (body.action === 'message' || body.action === 'review') {
        throw new Error('ฟีเจอร์นี้ยังไม่เปิดในรุ่นแรก');
      } else {
        throw new Error('ไม่รู้จักรายการที่ขอ');
      }

      await refresh();
      return result;
    } catch (e: any) {
      toast.error(e?.message || 'บันทึกไม่สำเร็จ');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const favorite = async (id: string) => {
    const saved = data.favorites.includes(id);
    if (await act({ action: 'favorite', spaceId: id, saved })) {
      toast.success(saved ? 'นำออกจากรายการที่บันทึกแล้ว' : 'บันทึกพื้นที่แล้ว');
    }
  };

  const submitAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setAuthMessage('');
    try {
      if (register) {
        const { data: result, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: { display_name: authName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (!result.session) {
          setAuthMessage('สมัครแล้ว กรุณากดยืนยันจากลิงก์ที่ส่งไปยังอีเมลของคุณ');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
      }
      setAuthOpen(false);
      setAuthName('');
      setAuthEmail('');
      setAuthPassword('');
      await refresh();
      toast.success(register ? 'สร้างบัญชีแล้ว' : 'เข้าสู่ระบบแล้ว');
    } catch (e: any) {
      setAuthMessage(e?.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setBusy(true);
    setAuthMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${path}` },
      });
      if (error) throw error;
    } catch (e: any) {
      setAuthMessage(e?.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
      setBusy(false);
    }
  };

  let view;
  if (path === '/') view = <Home />;
  else if (path === '/search') view = <SearchPage />;
  else if (path.startsWith('/spaces/')) view = <Detail id={path.split('/')[2]} />;
  else if (path === '/host/new') view = <Wizard />;
  else if (path === '/host/calendar') view = <HostCalendar />;
  else if (path === '/account' || path === '/host') view = <Account host={path === '/host'} />;
  else if (path === '/how-it-works') view = <HowItWorks />;
  else view = <div className="page empty"><h1>ไม่พบหน้านี้</h1><Link className="button" href="/">กลับหน้าหลัก</Link></div>;

  return (
    <AppContext.Provider value={{ data, all: data.spaces, ready, busy, act, refresh, auth, go, favorite }}>
      <header className="navbar">
        <Logo />
        <nav><Link href="/search">ค้นหาพื้นที่</Link><Link href="/#categories">หมวดหมู่</Link><Link href="/how-it-works">วิธีใช้งาน</Link></nav>
        {data.user
          ? <>
              <Link className="account-link" href="/account"><UserRound size={17} />{data.user.name}</Link>
              <Link className="button" href="/host/new"><Plus size={17} />ปล่อยพื้นที่</Link>
            </>
          : <button className="button" onClick={() => auth()}>เข้าสู่ระบบ/สมัครสมาชิก</button>}
      </header>
      {error && <div className="data-error">{error} <button className="text-link" onClick={() => void refresh()}>ลองใหม่</button></div>}
      <main>{view}</main>
      <footer className="footer">
        <div><Logo /><p>พื้นที่มีค่า ทุกเวลา</p></div>
        <div className="footer-links">
          <Link href="/how-it-works">รู้จัก WELAA</Link>
          <Link href="/host/new">เป็นเจ้าของพื้นที่</Link>
          <Link href="/account?tab=bookings">การจอง</Link>
          <span>© {new Date().getFullYear()} WELAA</span>
        </div>
        <small className="prototype-note">ส่งคำขอจองให้เจ้าของยืนยัน · ยังไม่มีการเรียกเก็บเงินจริง</small>
      </footer>
      <nav className="bottom-nav">
        <Link className={path === '/' ? 'active' : ''} href="/"><Compass />สำรวจ</Link>
        <Link className={path === '/search' ? 'active' : ''} href="/search"><Search />ค้นหา</Link>
        <Link className="add-nav" href="/host/new"><Plus />ปล่อยพื้นที่</Link>
        <Link href="/account?tab=bookings"><CalendarDays />การจอง</Link>
        <Link href="/account"><UserRound />โปรไฟล์</Link>
      </nav>
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent>
          <Logo />
          <DialogTitle className="auth-title">{register ? 'เริ่มต้นเวลาดี ๆ กับ WELAA' : 'ยินดีต้อนรับกลับ'}</DialogTitle>
          <DialogDescription>บัญชีเดียวสำหรับผู้เช่าและเจ้าของพื้นที่</DialogDescription>
          <button className="button full google-button mt" type="button" onClick={signInWithGoogle} disabled={busy}><span className="google-mark" aria-hidden="true">G</span>ดำเนินการต่อด้วย Google</button>
          <div className="auth-divider"><span>หรือใช้อีเมล</span></div>
          <form className="stack" onSubmit={submitAuth}>
            {register && <label className="field">ชื่อที่แสดง<input required maxLength={80} value={authName} onChange={(e) => setAuthName(e.target.value)} autoComplete="name" /></label>}
            <label className="field">อีเมล<input required type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} autoComplete="email" /></label>
            <label className="field">รหัสผ่าน<input required type="password" minLength={8} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} autoComplete={register ? 'new-password' : 'current-password'} /></label>
            {authMessage && <p className="notice">{authMessage}</p>}
            <button className="button full" disabled={busy}>{busy ? 'กำลังดำเนินการ…' : register ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}<ArrowUpRight size={18} /></button>
          </form>
          <button className="text-link mt" onClick={() => { setRegister(!register); setAuthMessage(''); }}>{register ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}</button>
          <p className="small muted mt">การจองเป็นคำขอรอเจ้าของยืนยัน และยังไม่มีการชำระเงินจริง</p>
        </DialogContent>
      </Dialog>
      <Toaster position="top-center" richColors />
    </AppContext.Provider>
  );
}
