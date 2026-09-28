import {createClient} from '@supabase/supabase-js';
import {BookingError,makeQuote,previewAllowed,validateSelection} from '@/lib/booking';

export const dynamic = 'force-dynamic';
export async function POST(request:Request) {
  const headers = {'Cache-Control':'no-store'};
  if (!previewAllowed(process.env)) return Response.json({error:'เปิดได้เฉพาะพรีวิวทดสอบ'}, {status:403,headers});
  try {
    const raw = await request.text();
    if(raw.length>2048) return Response.json({error:'ข้อมูลมากเกินไป'},{status:413,headers});
    const selection = validateSelection(JSON.parse(raw));
    // Anonymous, read-only requests. Never use the browser session or a service-role key.
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vhxcxsklfqbpncssoyfq.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_BW7cIDFRVLyl_oJJp9Zisw_HbHOqKDK',
      {auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(url,init)=>fetch(url,{...init,cache:'no-store',signal:AbortSignal.timeout(10000)})}},
    );
    const [listing,slots] = await Promise.all([
      db.from('listings').select('id,title,status,hourly_price,guest_limit,open_hour,close_hour').eq('id',selection.listingId).eq('status','published').maybeSingle(),
      db.from('availability').select('hour,hourly_price,is_open').eq('listing_id',selection.listingId).eq('available_date',selection.date),
    ]);
    if(listing.error || slots.error) return Response.json({error:'ตรวจข้อมูลล่าสุดไม่สำเร็จ กรุณาลองใหม่'},{status:503,headers});
    if(!listing.data) return Response.json({error:'ไม่พบพื้นที่ที่เปิดให้จอง'},{status:404,headers});
    // This is a quote, not an inventory hold. Public RLS cannot prove all booking conflicts.
    return Response.json({quote:makeQuote(selection,listing.data,slots.data??[])},{headers});
  } catch(error) {
    const expected = error instanceof BookingError || error instanceof SyntaxError || error instanceof RangeError;
    return Response.json({error:error instanceof BookingError?error.message:expected?'ข้อมูลการจองไม่ถูกต้อง':'ตรวจราคาไม่ได้ กรุณาลองใหม่'},{status:expected?400:503,headers});
  }
}
