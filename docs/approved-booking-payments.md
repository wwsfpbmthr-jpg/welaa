# Approved booking checkout

The customer flow is selection → reviewed quote → booking request → owner approval → payment simulation → shared receipt. The canonical booking URL is `/checkout?booking=<uuid>`. Customer booking cards expose a primary payment action after approval, and both parties read the same durable `demo_payments` row. Visible account and checkout pages refresh every 15 seconds.

Payment simulation accepts card or PromptPay without collecting card details or generating a transferable QR. It does not invoke Stripe, receive funds, or create real receipts. Previous separate `/checkout/test` sandbox tools remain preview-only.

Database setup: `db/demo-payment-setup.sql` was applied to the connected project. Each booking can have one immutable payment. RLS restricts reads to the renter and owner and inserts to the renter at the booking total. A private trigger locks the booking and rejects unapproved, expired and mismatched payments; the public RPC is SECURITY INVOKER and retry-safe.

Before receiving actual money, integrate a server-created provider payment session and verified webhook with a separate real-payment ledger; handle async PromptPay, cancellations, refunds, payment expiry and host payouts. Never interpret a demo payment as money received.

Validation: production build/type check, existing 16 booking/navigation/payment tests, authenticated database transaction tests for both methods, repeat requests, invalid methods, pending bookings, host receipt access and denied host payment. Test fixtures are rolled back.
