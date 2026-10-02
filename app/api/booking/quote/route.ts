import {BookingError,validateSelection} from '@/lib/booking';
import {loadQuote} from '@/lib/server-quote';
export const dynamic='force-dynamic';
export async function POST(request:Request) {
  const headers={'Cache-Control':'no-store'};
  try {
    const raw=await request.text();
    if(raw.length>2048)return Response.json({error:'ข้อมูลมากเกินไป'},{status:413,headers});
    const selection=validateSelection(JSON.parse(raw));
    if(selection.hypothetical)throw new BookingError('กรุณาเลือกเวลาที่เจ้าของเปิดให้จอง');
    const quote=await loadQuote(selection);
    // bookings stores whole baht; keep the displayed amount identical to the atomic RPC.
    const fee=Math.round(quote.subtotal/100*.08)*100;
    return Response.json({quote:{...quote,fee,total:quote.subtotal+fee}},{headers});
  } catch(error) {
    const invalid=error instanceof BookingError||error instanceof SyntaxError||error instanceof RangeError;
    return Response.json({error:error instanceof BookingError?error.message:invalid?'ข้อมูลการจองไม่ถูกต้อง':'ตรวจราคาไม่ได้ กรุณาลองใหม่'},{status:invalid?400:503,headers});
  }
}
