import {createClient} from '@supabase/supabase-js';
import {BookingError,makeQuote,type Selection} from './booking';

// Public, read-only quote. This does not hold inventory or create a booking.
export async function loadQuote(selection:Selection) {
  const db=createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL||'https://vhxcxsklfqbpncssoyfq.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_BW7cIDFRVLyl_oJJp9Zisw_HbHOqKDK',
    {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(url,init)=>fetch(url,{...init,cache:'no-store',signal:AbortSignal.timeout(10000)})}},
  );
  const [listing,slots]=await Promise.all([
    db.from('listings').select('id,title,status,hourly_price,guest_limit,open_hour,close_hour').eq('id',selection.listingId).eq('status','published').maybeSingle(),
    db.from('availability').select('hour,hourly_price,is_open').eq('listing_id',selection.listingId).eq('available_date',selection.date),
  ]);
  if(listing.error||slots.error)throw new Error('ตรวจข้อมูลล่าสุดไม่สำเร็จ กรุณาลองใหม่');
  if(!listing.data)throw new BookingError('ไม่พบพื้นที่ที่เปิดให้จอง');
  return makeQuote(selection,listing.data,slots.data??[]);
}
