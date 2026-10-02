import Stripe from 'stripe';
import {paymentConfig} from './payment-rules';
export function getTestStripe() {
  if(paymentConfig(process.env).mode!=='stripe_test')throw new Error('ยังไม่ได้เชื่อม Stripe โหมดทดสอบ');
  return new Stripe(process.env.STRIPE_SECRET_KEY!,{timeout:15000,maxNetworkRetries:1});
}
