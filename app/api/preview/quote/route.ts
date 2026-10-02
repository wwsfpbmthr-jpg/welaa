import {BookingError,previewAllowed,validateSelection} from '@/lib/booking';
import {loadQuote} from '@/lib/server-quote';
export const dynamic='force-dynamic';
export async function POST(request:Request) {
  const headers={'Cache-Control':'no-store'};
  if(!previewAllowed(process.env))return Response.json({error:'เปิดได้เฉพาะพรีวิวทดสอบ'},{status:403,headers});
  try {
    const raw=await request.text();
    if(raw.length>2048)return Response.json({error:'ข้อมูลมากเกินไป'},{status:413,headers});
    const quote=await loadQuote(validateSelection(JSON.parse(raw)));
    return Response.json({quote},{headers});
  } catch(error) {
    const expected=error instanceof BookingError||error instanceof SyntaxError||error instanceof RangeError;
    return Response.json({error:error instanceof BookingError?error.message:expected?'ข้อมูลการจองไม่ถูกต้อง':'ตรวจราคาไม่ได้ กรุณาลองใหม่'},{status:expected?400:503,headers});
  }
}
