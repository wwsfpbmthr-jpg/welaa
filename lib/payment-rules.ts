import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {previewAllowed,type Quote} from './booking.ts';
import type Stripe from 'stripe';
export type PaymentMethod='card'|'promptpay';
export type PaymentConfig={mode:'stripe_test'|'unconfigured';methods:PaymentMethod[]};
export function paymentConfig(env:{VERCEL_ENV?:string;NODE_ENV?:string;STRIPE_SECRET_KEY?:string}):PaymentConfig {
  // No live charges until inventory holds, durable webhook fulfilment and payouts are implemented.
  const ready=previewAllowed(env)&&Boolean(env.STRIPE_SECRET_KEY?.startsWith('sk_test_'));
  return {mode:ready?'stripe_test':'unconfigured',methods:['card','promptpay']};
}
export function sessionProof(sessionId:string,key:string) {return createHmac('sha256',key).update('welaa-preview-checkout:'+sessionId).digest('hex')}
export function validSessionProof(sessionId:string,proof:string|undefined,key:string) {
  if(!proof||!/^[a-f0-9]{64}$/.test(proof))return false;
  return timingSafeEqual(Buffer.from(proof,'hex'),Buffer.from(sessionProof(sessionId,key),'hex'));
}
export function checkoutParams(quote:Quote,method:PaymentMethod,origin:string):Stripe.Checkout.SessionCreateParams {
  if(!['card','promptpay'].includes(method))throw new Error('วิธีชำระเงินไม่ถูกต้อง');
  const s=quote.selection;
  const cancel=new URLSearchParams({...Object.fromEntries(Object.entries(s).map(([k,v])=>[k,String(v)])),cancelled:'1'});
  return {
    mode:'payment',allowed_payment_method_types:[method],ui_mode:'hosted_page',locale:'th',
    line_items:[
      {price_data:{currency:'thb',unit_amount:quote.subtotal,product_data:{name:quote.title,description:`${s.date} · ${s.start}:00–${s.end}:00 · ${s.guests} คน (รายการทดสอบ)`}},quantity:1},
      {price_data:{currency:'thb',unit_amount:quote.fee,product_data:{name:'ค่าบริการ WELAA 8% (ทดสอบ)'}},quantity:1},
    ],
    success_url:origin+'/checkout?stripe_session={CHECKOUT_SESSION_ID}',
    cancel_url:origin+'/checkout?'+cancel.toString(),
    metadata:{purpose:'welaa_preview',title:quote.title.slice(0,500),listingId:s.listingId,date:s.date,start:String(s.start),end:String(s.end),guests:String(s.guests),method,total:String(quote.total)},
    custom_text:{submit:{message:'โหมดทดสอบเท่านั้น ไม่ใช่การจองจริง และไม่มีการเรียกเก็บเงินจริง'}},
  };
}
export function checkoutKey(attempt:string,quote:Quote,method:PaymentMethod) {
  return 'welaa-preview-'+createHash('sha256').update(JSON.stringify({attempt,selection:quote.selection,total:quote.total,method})).digest('hex');
}
