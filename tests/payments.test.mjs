import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paymentConfig,sessionProof,validSessionProof,checkoutParams,checkoutKey} from '../lib/payment-rules.ts';
import {makeQuote} from '../lib/booking.ts';
const now=Date.parse('2026-10-02T00:00:00Z');
const listing={id:'196e9438-76df-42cf-9b62-2c881c3f1b25',title:'Test fixture',status:'published',hourly_price:280.49,guest_limit:12,open_hour:8,close_hour:20};
const selection={listingId:listing.id,date:'2026-10-03',start:9,end:11,guests:6,hypothetical:true};
const quote=makeQuote(selection,listing,[],now);
test('live keys and production can never enable checkout',()=>{
  for(const env of [{},{VERCEL_ENV:'preview'},{VERCEL_ENV:'production',STRIPE_SECRET_KEY:'sk_test_fixture'},{VERCEL_ENV:'preview',STRIPE_SECRET_KEY:'sk_live_fixture'},{NODE_ENV:'production',STRIPE_SECRET_KEY:'sk_test_fixture'}])assert.equal(paymentConfig(env).mode,'unconfigured');
  assert.equal(paymentConfig({VERCEL_ENV:'preview',STRIPE_SECRET_KEY:'sk_test_fixture'}).mode,'stripe_test');
  assert.equal(paymentConfig({NODE_ENV:'development',STRIPE_SECRET_KEY:'sk_test_fixture'}).mode,'stripe_test');
});
test('status proof cannot be reused for another session or tampered with',()=>{
  const proof=sessionProof('cs_test_one','test-secret');assert.equal(validSessionProof('cs_test_one',proof,'test-secret'),true);
  assert.equal(validSessionProof('cs_test_two',proof,'test-secret'),false);assert.equal(validSessionProof('cs_test_one',proof,'other-secret'),false);
  for(const bad of [undefined,'','hello','f'.repeat(63),'g'.repeat(64),'0'.repeat(64)])assert.equal(validSessionProof('cs_test_one',bad,'test-secret'),false);
});
test('Stripe line items use integer server totals in THB and selected payment method',()=>{
  for(const method of ['card','promptpay']){const params=checkoutParams(quote,method,'https://welaa.example');assert.deepEqual(params.allowed_payment_method_types,[method]);assert.equal(params.mode,'payment');assert.equal(params.line_items.reduce((n,l)=>n+l.price_data.unit_amount*l.quantity,0),quote.total);assert.ok(params.line_items.every(l=>Number.isInteger(l.price_data.unit_amount)&&l.price_data.currency==='thb'));assert.equal(params.metadata.purpose,'welaa_preview');assert.equal(params.metadata.method,method);assert.ok(params.success_url.includes('{CHECKOUT_SESSION_ID}'));assert.equal(new URL(params.cancel_url).searchParams.get('listingId'),selection.listingId)}
  assert.throws(()=>checkoutParams(quote,'unknown','https://welaa.example'));
});
test('retry is idempotent while method, selection and price changes create distinct sessions',()=>{
  const key=checkoutKey('attempt',quote,'card');assert.equal(checkoutKey('attempt',{...quote,expiresAt:quote.expiresAt+1},'card'),key);
  assert.notEqual(checkoutKey('attempt',quote,'promptpay'),key);assert.notEqual(checkoutKey('other',quote,'card'),key);assert.notEqual(checkoutKey('attempt',{...quote,total:quote.total+1},'card'),key);assert.notEqual(checkoutKey('attempt',{...quote,selection:{...selection,guests:7}},'card'),key);
});
