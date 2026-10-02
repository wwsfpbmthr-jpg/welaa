# WELAA payment preview

The customer flow is listing → date/hour/guest selection → server quote → review and consent → card or PromptPay → payment result.

## Current modes

- Without credentials: an explicitly labelled simulator. No card input or transferable QR is generated. Test history is stored only in the browser tab.
- With `STRIPE_SECRET_KEY=sk_test_...` in Vercel Preview: Stripe-hosted **test** Checkout, with the selected `card` or `promptpay` method and THB line items. No publishable key is needed for a hosted redirect. Enable PromptPay in a Thailand Stripe sandbox/account.
- Production and `sk_live_...` keys are intentionally rejected by payment endpoints. This feature does not charge real customers.

Add the test secret in the deployment environment, not source code or chat, and redeploy. No keys were supplied or installed as part of this change. `/api/payments/config` exposes only public readiness, never the key.

## Controls implemented

- Prices, capacity, dates and opening hours are read and validated on the server, using published listings and anonymous read-only Supabase access.
- Client totals are compared with the fresh quote; a price change requires another review.
- Stripe Sessions use integer satang and idempotency keys for retries. Duplicate clicks are blocked in the UI.
- Same-origin POSTs only. Return URLs are constructed from the server request origin.
- The result page checks Stripe server-side. A signed HttpOnly, SameSite cookie binds access to the browser that created the session. A redirect alone never marks a payment as paid.
- Payment status can be pending, paid or expired; result retrieval errors do not imply payment failure.
- Simulator and Stripe test results do not create real bookings or hold inventory. The existing sandbox state machine still supports failed payment, cancellation and simulated refund.

## Before accepting real money

Implement an authenticated, durable booking/payment record and atomic inventory hold; reconcile payment and asynchronous completion using a signature-verified, idempotent Stripe webhook; release expired holds and handle cancellations/refunds; define owner acceptance and refund policies; and verify the Stripe/Connect arrangement and payouts for the Thai marketplace. User identity, totals and inventory must never be trusted from query strings or browser storage. PromptPay cannot use manual capture, so owner confirmation and refund policy must be resolved before launch.

The payment page and test adapter are prepared. Live payments, financial receipts, owner payouts and real booking confirmation are not yet enabled.

Official references: https://docs.stripe.com/checkout/quickstart and https://docs.stripe.com/payments/promptpay
