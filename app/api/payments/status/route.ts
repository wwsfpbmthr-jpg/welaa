import {NextRequest,NextResponse} from 'next/server';
import {paymentConfig,validSessionProof} from '@/lib/payment-rules';
import {getTestStripe} from '@/lib/stripe';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest) {
  const headers={'Cache-Control':'no-store'},id=request.nextUrl.searchParams.get('session_id')||'';
  if(paymentConfig(process.env).mode!=='stripe_test')return NextResponse.json({error:'ยังไม่ได้เชื่อม Stripe โหมดทดสอบ'},{status:503,headers});
  if(!/^cs_test_[A-Za-z0-9]+$/.test(id)||!validSessionProof(id,request.cookies.get('welaa-'+id)?.value,process.env.STRIPE_SECRET_KEY!))return NextResponse.json({error:'ไม่พบรายการทดสอบของเบราว์เซอร์นี้'},{status:403,headers});
  try {
    const session=await getTestStripe().checkout.sessions.retrieve(id);
    if(session.livemode||session.metadata?.purpose!=='welaa_preview'||session.currency!=='thb'||session.amount_total!==Number(session.metadata.total))throw new Error('Invalid session');
    return NextResponse.json({status:session.payment_status==='paid'?'paid':session.status==='expired'?'expired':'pending',id,title:session.metadata.title,total:session.amount_total,date:session.metadata.date,start:Number(session.metadata.start),end:Number(session.metadata.end),guests:Number(session.metadata.guests),listingId:session.metadata.listingId,method:session.metadata.method},{headers});
  } catch{return NextResponse.json({error:'ตรวจผลชำระเงินไม่สำเร็จ กรุณาลองใหม่'},{status:503,headers})}
}
