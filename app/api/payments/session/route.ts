import {NextResponse} from 'next/server';
import {BookingError,validateSelection} from '@/lib/booking';
import {loadQuote} from '@/lib/server-quote';
import {checkoutKey,checkoutParams,paymentConfig,sessionProof} from '@/lib/payment-rules';
import {getTestStripe} from '@/lib/stripe';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request) {
  const headers={'Cache-Control':'no-store'};
  if(paymentConfig(process.env).mode!=='stripe_test')return NextResponse.json({error:'ยังไม่ได้เชื่อม Stripe โหมดทดสอบ ไม่มีการเรียกเก็บเงิน'},{status:503,headers});
  if(request.headers.get('origin')!==new URL(request.url).origin)return NextResponse.json({error:'คำขอไม่ถูกต้อง'},{status:403,headers});
  try {
    const raw=await request.text();
    if(raw.length>4096)return NextResponse.json({error:'ข้อมูลมากเกินไป'},{status:413,headers});
    const body=JSON.parse(raw);
    if(body.agree!==true||!['card','promptpay'].includes(body.method)||typeof body.attempt!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.attempt))return NextResponse.json({error:'กรุณาตรวจรายละเอียดและเลือกวิธีชำระเงิน'},{status:400,headers});
    const quote=await loadQuote(validateSelection(body.selection));
    if(body.expectedTotal!==quote.total)return NextResponse.json({error:'ราคาเปลี่ยน กรุณาตรวจยอดอีกครั้ง',quote},{status:409,headers});
    const stripe=getTestStripe();
    const session=await stripe.checkout.sessions.create(checkoutParams(quote,body.method,new URL(request.url).origin),{idempotencyKey:checkoutKey(body.attempt,quote,body.method)});
    if(session.livemode||!session.url||new URL(session.url).hostname!=='checkout.stripe.com')throw new Error('Invalid checkout session');
    const response=NextResponse.json({url:session.url},{headers});
    response.cookies.set('welaa-'+session.id,sessionProof(session.id,process.env.STRIPE_SECRET_KEY!),{httpOnly:true,secure:new URL(request.url).protocol==='https:',sameSite:'lax',path:'/api/payments',maxAge:86400});
    return response;
  } catch(error) {
    const expected=error instanceof BookingError||error instanceof SyntaxError||error instanceof RangeError;
    return NextResponse.json({error:error instanceof BookingError?error.message:expected?'ข้อมูลการจองไม่ถูกต้อง':'เปิดหน้าชำระเงินไม่สำเร็จ กรุณาลองใหม่ หรือเลือกวิธีอื่น'},{status:expected?400:503,headers});
  }
}
