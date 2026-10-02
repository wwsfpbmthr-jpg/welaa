'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const Checkout = dynamic(() => import('./checkout'));
const DesignPreview = dynamic(() => import('./design-preview'));
import { usePathname, useRouter } from 'next/navigation';
import { FlaskConical, Plus, Search, Compass, CalendarDays, UserRound, ArrowUpRight, ShieldCheck, Menu, House, Heart, CircleHelp, LogOut, Eye, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Toaster, toast } from 'sonner';
import { AppContext } from './context';
import { AppData, Space, initial, coordinates, datePlus, today, normalizeActivities } from './data';
import { Logo, LoadingDots } from './ui';
import { Home, SearchPage, HowItWorks } from './views';
import { Detail } from './detail';
import { Wizard } from './wizard';
import { Account, HostCalendar } from './account';
import { Profile } from './profile';
import { Admin } from './admin';
import { supabase } from '@/lib/supabase/client';
import { useSlowLoading } from '@/hooks/use-slow-loading';

function GoogleBrandMark() {
  return <svg className="google-brand-mark" aria-hidden="true" viewBox="0 0 48 48" width="23" height="23">
    <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15Z"/>
    <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4.1 2-6.8 2-5.2 0-9.7-3.5-11.3-8.2H5.8v5.2A20 20 0 0 0 24 44Z"/>
    <path fill="#FBBC05" d="M12.7 27.8a12 12 0 0 1 0-7.6V15H5.8a20 20 0 0 0 0 18Z"/>
    <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.8 15l6.9 5.2c1.6-4.7 6.1-8.1 11.3-8.1Z"/>
  </svg>;
}

function FacebookBrandMark() {
  return <svg className="facebook-brand-mark" aria-hidden="true" viewBox="0 0 24 24" width="23" height="23">
    <rect width="24" height="24" rx="5" fill="#0866FF"/>
    <path fill="#fff" d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.2H7.6V13h2.7v8h3.1Z"/>
  </svg>;
}

function AppleBrandMark() {
  return <svg className="apple-brand-mark" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M17.05 12.54c.02 3.26 2.86 4.34 2.89 4.36-.02.08-.45 1.55-1.49 3.07-.9 1.31-1.83 2.62-3.3 2.64-1.45.03-1.92-.86-3.58-.86-1.65 0-2.17.83-3.55.89-1.42.05-2.51-1.42-3.42-2.72C2.73 17.25 1.3 12.36 3.22 9.06a5.3 5.3 0 0 1 4.5-2.72c1.41-.03 2.75.95 3.61.95.86 0 2.48-1.18 4.19-1.01.72.03 2.74.29 4.03 2.2-.1.06-2.4 1.39-2.37 4.06h-.13ZM14.33 4.55c.76-.91 1.27-2.18 1.13-3.44-1.09.04-2.41.73-3.19 1.64-.7.8-1.32 2.09-1.15 3.32 1.21.09 2.45-.62 3.21-1.52Z"/></svg>;
}

const appleAuthEnabled = process.env.NEXT_PUBLIC_APPLE_AUTH_ENABLED === 'true';

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
    activities: normalizeActivities(row.activities ?? []),
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
    status: row.status,
    rules: row.rules ?? '',
  };
}

export default function Welaa({previewMode=false}:{previewMode?:boolean}) {
  const path = usePathname() || '/';
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const showNavigationLoading = useSlowLoading(isNavigating);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const navPath = pendingPath ?? path;
  const activeNavIndex = navPath === '/' ? 0 : navPath === '/search' ? 1 : navPath === '/host/new' ? 2 : navPath === '/account' ? 3 : navPath === '/profile' || navPath === '/host' || navPath === '/host/calendar' ? 4 : -1;
  const [data, setData] = useState<AppData>(initial);
  const [ready, setReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const authRevision = useRef(0);
  const refreshRequest = useRef(0);
  const lastRefreshAt = useRef(0);
  const lastAuthUserId = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [register, setRegister] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authStep, setAuthStep] = useState<'email' | 'credentials' | 'confirmation'>('email');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let active = true;
    if (!data.user) {
      setIsAdmin(false);
      return () => { active = false; };
    }
    setIsAdmin(false);
    (supabase as any).from('admin_members').select('user_id').eq('user_id', data.user.id).maybeSingle()
      .then(({ data: membership }: { data: unknown }) => { if (active) setIsAdmin(!!membership); });
    return () => { active = false; };
  }, [data.user?.id]);

  const refresh = useCallback(async () => {
    const requestRevision = authRevision.current;
    const requestId = ++refreshRequest.current;
    lastRefreshAt.current = Date.now();
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const authResult = sessionData.session ? await supabase.auth.getUser() : null;
      if (authResult?.error) throw authResult.error;
      const user = authResult?.data.user ?? null;
      if (requestRevision !== authRevision.current || requestId !== refreshRequest.current) return;
      setAuthReady(true);

      // Independent queries run together; availability depends only on listing IDs.
      let listingQuery = supabase.from('listings').select('*').order('created_at', { ascending: false });
      if (user) listingQuery = listingQuery.or(`status.eq.published,owner_id.eq.${user.id}`);
      else listingQuery = listingQuery.eq('status', 'published');
      const [profileResult, listingsData, bookingsResult, favoritesResult] = await Promise.all([
        user ? supabase.from('profiles').select('*').eq('id', user.id).maybeSingle() : Promise.resolve({ data: null, error: null }),
        (async () => {
          const result = await listingQuery;
          if (result.error) throw result.error;
          const rows = result.data ?? [];
          const ids = rows.map(row => row.id);
          if (!ids.length) return { rows, availability: [] };
          const slots = await supabase.from('availability')
            .select('listing_id,available_date,hour,hourly_price,is_open')
            .in('listing_id', ids).gte('available_date', today()).lte('available_date', datePlus(180));
          if (slots.error) throw slots.error;
          return { rows, availability: slots.data ?? [] };
        })(),
        user ? supabase.from('bookings').select('*').order('created_at', { ascending: false }) : Promise.resolve({ data: [], error: null }),
        user ? supabase.from('favorites').select('listing_id') : Promise.resolve({ data: [], error: null }),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (bookingsResult.error) throw bookingsResult.error;
      if (favoritesResult.error) throw favoritesResult.error;
      const profile = profileResult.data;
      const listingRows = listingsData.rows;
      const availabilityRows = listingsData.availability;
      const bookingRows = bookingsResult.data ?? [];
      const favoriteRows = favoritesResult.data ?? [];
      let draft = null;
      try {
        const stored = JSON.parse(window.localStorage.getItem('welaa-draft') || 'null');
        if (stored && typeof stored === 'object' && !Array.isArray(stored)) draft = stored;
      } catch {
        // Corrupt or unavailable device storage must not stop remote data loading.
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
        draft,
      };
      if (requestRevision !== authRevision.current || requestId !== refreshRequest.current) return;
      setData(nextData);
      setError('');
      setReady(true);
    } catch (e: any) {
      if (requestRevision === authRevision.current && requestId === refreshRequest.current) {
        const message = e?.message || 'โหลดข้อมูลไม่สำเร็จ';
        if (e?.name === 'AuthSessionMissingError' || /auth session missing/i.test(message)) {
          // Only an explicit auth event may sign the user out. A transient Auth API
          // response must not make protected pages flash their logged-out state.
          setError('');
        } else {
          setError(message);
        }
        setReady(true);
      }
    } finally {
      if (requestRevision === authRevision.current && requestId === refreshRequest.current) setAuthReady(true);
    }
  }, []);

  useEffect(() => {
    const { data: authState } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return;
      const nextUserId = session?.user?.id ?? null;
      if (event === 'SIGNED_IN' && nextUserId === lastAuthUserId.current && Date.now() - lastRefreshAt.current < 60_000) return;
      lastAuthUserId.current = nextUserId;
      authRevision.current += 1;
      const authUser = session?.user;
      if (authUser) {
        setData((current) => {
          const sameUser = current.user?.id === authUser.id;
          const metadataName = authUser.user_metadata?.display_name ?? authUser.user_metadata?.full_name;
          const fallbackName = authUser.email?.split('@')[0] ?? 'สมาชิก';
          return {
            ...current,
            user: {
              id: authUser.id,
              email: authUser.email ?? current.user?.email ?? '',
              name: sameUser ? current.user!.name : metadataName ?? fallbackName,
              phone: sameUser ? current.user!.phone : authUser.phone ?? '',
              bio: sameUser ? current.user!.bio : '',
            },
            ...(current.user && !sameUser
              ? { spaces: current.spaces.filter((space) => space.status === 'published'), bookings: [], favorites: [], messages: [], reviews: [] }
              : {}),
          };
        });
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        setData((current) => ({
          ...current,
          user: null,
          spaces: current.spaces.filter((space) => !space.owner),
          bookings: [],
          favorites: [],
          messages: [],
          reviews: [],
          draft: null,
        }));
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_OUT' || authUser) setAuthReady(true);
      window.setTimeout(() => void refresh(), 0);
    });
    const handleFocus = () => {
      if (Date.now() - lastRefreshAt.current > 60_000) void refresh();
    };
    window.addEventListener('focus', handleFocus);
    // INITIAL_SESSION schedules the first refresh, avoiding a duplicate request.
    return () => {
      window.removeEventListener('focus', handleFocus);
      authState.subscription.unsubscribe();
    };
  }, [refresh]);

  const authReturnPath = () => {
    const next = new URLSearchParams(window.location.search).get('next') || '/';
    return next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') && !next.startsWith('/login') ? next : '/';
  };
  useEffect(() => {
    if (path === '/login') {
      setAuthStep('email');
      setAuthPassword('');
      setShowPassword(false);
      setRegister(new URLSearchParams(window.location.search).get('mode') === 'signup');
      setAuthMessage('');
    }
  }, [path]);

  const auth = (v = false) => {
    setAuthStep('email');
    setAuthPassword('');
    setShowPassword(false);
    setRegister(v);
    setAuthMessage('');
    const next = path === '/login' ? '/' : path + window.location.search;
    startNavigation(() => router.push(`/login?next=${encodeURIComponent(next)}${v ? '&mode=signup' : ''}`));
  };
  useEffect(() => { setPendingPath(null); }, [path]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      ['/search', '/account', '/profile', '/host/new'].forEach((route) => router.prefetch(route));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [router]);
  const markNav = (destination: string) => {
    const target = destination.split('?')[0];
    if (target !== path) setPendingPath(target);
  };
  const go = (destination: string) => {
    const target = new URL(destination, window.location.origin);
    if (!isNavigating && target.pathname + target.search === path + window.location.search) return;
    markNav(destination);
    startNavigation(() => router.push(destination));
  };
  const signOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    if (signOutError) {
      toast.error('ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
      return;
    }
    authRevision.current += 1;
    setData((current) => ({ ...current, user: null, spaces: current.spaces.filter((space) => !space.owner), bookings: [], favorites: [], messages: [], reviews: [], draft: null }));
    setAuthReady(true);
    router.replace('/');
    toast.success('ออกจากระบบแล้ว');
  };

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
        if (!body.saved) {
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
        setData((current) => ({
          ...current,
          favorites: body.saved
            ? current.favorites.filter((favoriteId) => favoriteId !== body.spaceId)
            : current.favorites.includes(body.spaceId) ? current.favorites : [...current.favorites, body.spaceId],
        }));
        return true;
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
    if (busy) return;
    if (authStep === 'email') {
      setAuthEmail(authEmail.trim());
      setAuthMessage('');
      setAuthStep('credentials');
      return;
    }
    if (authStep !== 'credentials') return;
    if (register && !authName.trim()) { setAuthMessage('กรุณาใส่ชื่อที่แสดง'); return; }
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
          setAuthStep('confirmation');
          setAuthPassword('');
          setShowPassword(false);
          setAuthMessage('กรุณากดยืนยันจากลิงก์ในอีเมล หากมีบัญชีอยู่แล้วให้กลับไปเข้าสู่ระบบ');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
      }
      router.replace(authReturnPath());
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

  const signInWithProvider = async (provider: 'google' | 'facebook' | 'apple') => {
    setBusy(true);
    setAuthMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}${authReturnPath()}` },
      });
      if (error) throw error;
    } catch (e: any) {
      const providerName = provider === 'apple' ? 'Apple' : provider === 'facebook' ? 'Facebook' : 'Google';
      setAuthMessage(e?.message || `เข้าสู่ระบบด้วย ${providerName} ไม่สำเร็จ`);
      setBusy(false);
    }
  };

  if (path === '/design-preview' && previewMode) return <DesignPreview/>;

  const authView = <section className="auth-page">
    <Link className="auth-back-link" href="/">กลับหน้าหลัก</Link>
    <div className="auth-page-content">
          <Logo />
          <h1 className="auth-title">{authStep === 'confirmation' ? 'ยืนยันอีเมลของคุณ' : authStep === 'credentials' ? register ? 'สร้างบัญชีของคุณ' : 'ใส่รหัสผ่าน' : 'เข้าสู่ระบบหรือสมัครสมาชิก'}</h1>
          <p className="auth-description">{authStep === 'email' ? 'เริ่มต้นด้วยอีเมลของคุณ' : authStep === 'confirmation' ? 'ตรวจกล่องจดหมายและโฟลเดอร์สแปม' : register ? 'เพิ่มชื่อและตั้งรหัสผ่านเพื่อเริ่มต้น' : 'เข้าสู่บัญชี WELAA ของคุณ'}</p>
          {authStep !== 'confirmation' ? <form className="stack auth-email-form auth-email-primary" onSubmit={submitAuth}>
            {authStep === 'email' ? <label className="field">อีเมล<input required type="email" maxLength={254} value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="name@example.com" /></label> : <>
              <div className="auth-identity"><span>{authEmail}</span><button type="button" className="text-link" disabled={busy} onClick={() => { setAuthStep('email'); setAuthPassword(''); setShowPassword(false); setAuthMessage(''); }}>แก้ไข</button></div>
              {register && <label className="field">ชื่อที่แสดง<input required maxLength={80} value={authName} onChange={(e) => setAuthName(e.target.value)} autoComplete="name" autoFocus disabled={busy}/></label>}
              <label className="field">{register ? 'ตั้งรหัสผ่าน' : 'รหัสผ่าน'}<div className="auth-password-field"><input required type={showPassword ? 'text' : 'password'} minLength={register ? 8 : 1} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} autoComplete={register ? 'new-password' : 'current-password'} autoFocus={!register} disabled={busy} placeholder={register ? 'อย่างน้อย 8 ตัวอักษร' : 'รหัสผ่านของคุณ'} /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label>
            </>}
            {authMessage && <p className="notice" role="status">{authMessage}</p>}
            <button className="button full" disabled={busy}>{busy ? 'กำลังดำเนินการ…' : authStep === 'email' ? 'ต่อไป' : register ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</button>
          </form> : <div className="auth-confirmation"><strong>{authEmail}</strong><p className="notice" role="status">{authMessage}</p><button className="button full" onClick={() => { setRegister(false); setAuthStep('credentials'); setAuthMessage(''); }}>กลับไปเข้าสู่ระบบ</button></div>}
          {authStep !== 'confirmation' && <button className="text-link auth-mode-switch" disabled={busy} onClick={() => { setRegister(!register); setAuthPassword(''); setShowPassword(false); setAuthMessage(''); }}>{register ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}</button>}
          <div className="auth-divider auth-divider-compact"><span>หรือ</span></div>
          <div className="auth-provider-icons" role="group" aria-label="เข้าสู่ระบบด้วยบัญชีอื่น">
            <button className="auth-social-icon" type="button" aria-label="ดำเนินการต่อด้วย Google" title="ดำเนินการต่อด้วย Google" onClick={() => signInWithProvider('google')} disabled={busy}><GoogleBrandMark /></button>
            <button className="auth-social-icon" type="button" aria-label="ดำเนินการต่อด้วย Facebook" title="ดำเนินการต่อด้วย Facebook" onClick={() => signInWithProvider('facebook')} disabled={busy}><FacebookBrandMark /></button>
            <button className="auth-social-icon" type="button" aria-label={appleAuthEnabled ? 'ดำเนินการต่อด้วย Apple' : 'Apple ID ยังไม่เปิดให้บริการ'} title={appleAuthEnabled ? 'ดำเนินการต่อด้วย Apple' : 'Apple ID ยังไม่เปิดให้บริการ'} aria-describedby={!appleAuthEnabled ? 'apple-auth-status' : undefined} onClick={() => signInWithProvider('apple')} disabled={busy || !appleAuthEnabled}><AppleBrandMark /></button>
          </div>
          {!appleAuthEnabled && <p id="apple-auth-status" className="auth-apple-status">Apple ID · เร็ว ๆ นี้</p>}


    </div>
  </section>;

  let view;
  if (path === '/login') view = authView;
  else if (path === '/') view = <Home />;
  else if (path === '/search') view = <SearchPage />;
  else if (path === '/checkout' && previewMode) view = <Checkout />;
  else if (path.startsWith('/spaces/')) view = <Detail id={path.split('/')[2]} />;
  else if (path === '/host/new') view = <Wizard />;
  else if (path === '/host/calendar') view = <HostCalendar />;
  else if (path === '/account' || path === '/host') view = <Account host={path === '/host'} />;
  else if (path === '/profile') view = <Profile />;
  else if (path === '/admin') view = <Admin />;
  else if (path === '/how-it-works') view = <HowItWorks />;
  else view = <div className="page empty"><h1>ไม่พบหน้านี้</h1><Link className="button" href="/">กลับหน้าหลัก</Link></div>;

  return (
    <AppContext.Provider value={{ data, all: data.spaces, previewMode, ready, authReady, busy, act, refresh, auth, go, favorite, signOut }}>
      {path !== '/login' && <header className="navbar marketplace-navbar">
        <Logo />
        <nav aria-label="เมนูหลักบนคอมพิวเตอร์"><Link aria-current={path==='/search'?'page':undefined} href="/search">ค้นหาพื้นที่</Link><Link href="/host/new">ปล่อยพื้นที่</Link><Link aria-current={path==='/how-it-works'?'page':undefined} href="/how-it-works">วิธีใช้งาน</Link></nav>
        {!authReady
          ? <span aria-hidden="true" style={{ display: 'inline-block', width: 46, height: 46, flexShrink: 0 }} />
          : data.user
          ? <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="button secondary"
                    type="button"
                    aria-label="เปิดเมนูบัญชี"
                    title="เมนูบัญชี"
                    style={{ width: 46, height: 46, padding: 0, borderRadius: 10 }}
                  >
                    <Menu size={21} aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  style={{ minWidth: 250, padding: 8, borderColor: '#e1e5e7', borderRadius: 12, background: '#fff', color: '#172d3e', boxShadow: '0 14px 40px #172d3e1c' }}
                >
                  <DropdownMenuLabel style={{ padding: '10px 12px' }}>
                    <span style={{ display: 'block', fontWeight: 600 }}>{data.user.name}</span>
                    <span style={{ display: 'block', color: '#72808a', fontSize: 13, fontWeight: 400, overflowWrap: 'anywhere' }}>{data.user.email}</span>
                  </DropdownMenuLabel>
                  {isAdmin&&<DropdownMenuItem asChild><Link href="/admin"><ShieldCheck/>ศูนย์จัดการ CEO</Link></DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/account?tab=bookings"><CalendarDays />การจองของฉัน</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/host"><House />พื้นที่ของฉัน</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account?tab=saved"><Heart />พื้นที่ที่บันทึกไว้</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account?tab=profile"><UserRound />โปรไฟล์และการตั้งค่า</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/how-it-works"><CircleHelp />วิธีใช้งานและความช่วยเหลือ</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => { void signOut(); }}>
                    <LogOut />ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          : <button className="button" onClick={() => auth()} aria-label="เข้าสู่ระบบหรือสมัครสมาชิก">เข้าสู่ระบบ</button>}
      </header>}
      {error && <div className="data-error">{error} <button className="text-link" onClick={() => void refresh()}>ลองใหม่</button></div>}

      <main className={path === '/login' ? 'auth-main' : undefined} aria-busy={isNavigating}>{view}</main>
      {showNavigationLoading && <LoadingDots overlay />}
      {path !== '/login' && <footer className="footer">
        <div><Logo /><p>พื้นที่มีค่า ทุกเวลา</p></div>
        <div className="footer-links">
          <Link href="/how-it-works">รู้จัก WELAA</Link>
          <Link href="/host/new">เป็นเจ้าของพื้นที่</Link>
          <Link href="/account?tab=bookings">การจอง</Link>
          <span>© {new Date().getFullYear()} WELAA</span>
        </div>
      {previewMode && <div className="preview-workspace-bar"><FlaskConical size={14}/><span>พรีวิว WELAA · ไม่รับเงินจริง</span><Link href="/checkout?history=1">รายการทดสอบ</Link></div>}
        <small className="prototype-note">ส่งคำขอจองให้เจ้าของยืนยัน · ยังไม่มีการเรียกเก็บเงินจริง</small>
      </footer>}
      {path !== '/login' && <nav className={'bottom-nav' + (activeNavIndex < 0 ? ' no-active' : ' active-' + activeNavIndex)} aria-label="เมนูหลัก">
        <Link className={'bottom-nav-item' + (activeNavIndex === 0 ? ' active' : '')} href="/" onNavigate={(event) => { event.preventDefault(); go('/'); }}><Compass />สำรวจ</Link>
        <Link className={'bottom-nav-item' + (activeNavIndex === 1 ? ' active' : '')} href="/search" onNavigate={(event) => { event.preventDefault(); go('/search'); }}><Search />ค้นหา</Link>
        <Link className={'bottom-nav-item add-nav' + (activeNavIndex === 2 ? ' active' : '')} href="/host/new" onNavigate={(event) => { event.preventDefault(); go('/host/new'); }}><Plus />ปล่อยพื้นที่</Link>
        <Link className={'bottom-nav-item' + (activeNavIndex === 3 ? ' active' : '')} href="/account?tab=bookings" onNavigate={(event) => { event.preventDefault(); if (!data.user) auth(); else go('/account?tab=bookings'); }}><CalendarDays />การจอง</Link>
        <Link className={'bottom-nav-item' + (activeNavIndex === 4 ? ' active' : '')} href="/profile" onNavigate={(event) => { event.preventDefault(); go('/profile'); }}><UserRound />โปรไฟล์</Link>
      </nav>}
      <Toaster position="top-center" richColors />
    </AppContext.Provider>
  );
}
