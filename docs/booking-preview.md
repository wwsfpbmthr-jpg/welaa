# WELAA booking experience — preview only

## What this build does

- Reads published listings and published schedules from the existing system. No new database writes, migrations, booking RPCs, messages, gateway requests, or card collection are performed by the new checkout.
- Carries search date, time and guests into detail, then into a dedicated review/payment/status flow. Preserves the existing homepage, authentication and owner/admin tools.
- Recalculates every hour and the existing 8% service fee server-side in integer satang. Rejects bad dates, capacity, opening hours, unpublished listings and unavailable schedules. Quotes expire after 10 minutes and are rechecked before simulated payment.
- Optional, explicitly labelled hypothetical times allow testing when the owner has no future open schedule. Only the listing's base price is used in that mode. A quote never reserves inventory.
- Simulator separates booking and payment state: awaiting payment → paid / awaiting host → confirmed; failure permits retry; cancellation after payment → refund pending → refunded. Host approval/refund buttons are explicitly simulation tools.
- Test receipts are kept in this browser tab's sessionStorage only, maximum 20, no personal/contact/card information. They are not authoritative records, don't sync across devices and disappear with the session. Storage failure prevents showing a false success.
- The new flow and quote API are allowed only on Vercel preview or local development. Production / unknown environments fail closed. Do not promote this branch as a production payment solution.

## Before a real gateway sandbox integration

1. Provision a separate staging Supabase project/branch. Do not point test booking mutations at the production project. Copy the schema and use non-personal test records.
2. Choose a payment provider and merchant entity; configure sandbox keys through server environment settings. No keys in source or client bundles. This build intentionally does not provision a provider or claim to process Stripe test payments.
3. Implement authenticated, server-owned quotes and immutable order price snapshots. Use the authoritative owner-approved pricing/tax/cancellation rules; the current 8% is inherited UI pricing, not an approved commercial/tax policy.
4. Add transactionally unique inventory holds and expiry, including idempotent booking creation, conflict checks for every renter, timezone boundaries and host-approval deadline. Public availability rows alone do not prove absence of bookings hidden by RLS.
5. Add booking/payment tables in staging with owner/renter/admin RLS and role tests. Never trust receipt URLs, sessionStorage, client totals or client-supplied user IDs.
6. Connect hosted sandbox checkout to authenticated server order creation with provider idempotency keys. Verify raw webhook signatures, reject live events/keys, deduplicate event IDs and reconcile out-of-order events. Redirect success pages must never mark an order paid.
7. Implement verified payment → confirmation / host approval, cancellation → refund request → webhook-confirmed refund. Handle partial refunds, denied/expired approval, payment timeout and cancellation/webhook races.
8. Use an outbox for email/in-app notifications, retry delivery and keep an audit trail. Confirm owner/renter messages and actual refund timing with the product owner.

## Acceptance before receiving real money

End-to-end staging tests with two users racing for one slot; card decline; interrupted return; duplicate/late webhooks; repeated submission; expiry; host rejection; cancellations/refunds; unauthorised data access; currency rounding; Thai/English; mobile Safari, iPad and desktop. Confirm policies, tax invoices, privacy, provider setup and monitoring. Only then request explicit production approval.

## Local verification

`node --experimental-strip-types --test tests/booking.test.mjs`

`npx tsc --noEmit`

`npm run build`

No live booking, cancellation, owner approval or payment should be used as a test.
