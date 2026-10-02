# Booking and account flow repair

- Production and preview use the same reservation and checkout UI. Preview no longer controls the customer booking route.
- Mobile listing details show the reservation panel before long-form content and keep a booking action visible.
- `/checkout` reads current server prices, displays card/PromptPay readiness honestly, and submits an authenticated durable booking request.
- `/checkout?booking=<id>` renders only the signed-in renter's booking. Test checkout is isolated at `/checkout/test` on preview deployments.
- Auth returns to the same origin root, then resumes the sanitized booking URL from session storage. The full query selection survives email login as well.
- `request_booking_reviewed` is an authenticated, SECURITY INVOKER wrapper around the existing booking RPC. The transaction rejects price changes, rejects past start times, and returns the existing active request on retry. No new table grants were added.
- Host dashboard defaults to booking requests, shows active/pending/closed filters, and links directly to availability. Hosts can repeat selected hours for 7/14/30 days. Partial batch errors report how many days succeeded.
- Fixed inverted favorites toggle and removed legacy ChatGPT sign-out link from account settings.

## Payment limitation

The current integration is test-only and no live account is configured. Production cannot accept card/PromptPay payments, issue paid receipts, or pay out to hosts. This change does not remove the safety gate. UI does not claim requests are paid. See payments.md for the required live-payment work.

## Validation

Production webpack build and TypeScript passed. Booking/payment/navigation test suites passed. Database checks used synthetic users and a synthetic listing inside a rolled-back transaction: RLS access, changed-price rollback, idempotent retry, cancellation and slot release passed; no test rows were retained.

No future open availability existed in published listings at inspection time. Owners must explicitly open future days; this change does not alter their schedules automatically.
