# WELAA 2.0: audit and architecture

Baseline: `b27f18e83e52ee4394f69e6bf5e1ab17be988ca1` (main, 10 October 2026).

## Findings

- Next.js catch-all routes render through a persistent client application in `app/welaa.tsx`. Authentication, Supabase refresh, favorites, listing publication, and booking mutations belong to this controller. Keep these in place during the visual migration.
- Homepage started with a search form; no brand introduction or activity discovery journey. Public inspection returned an empty published inventory. Do not manufacture listings, review counts, or popularity.
- Seven CSS layers mix transaction styles and old homepage styles. Introduce shared tokens and isolated experience modules; retain transaction layers to avoid breaking their selectors. Further migration of legacy styles is an incremental follow-up.
- Search filters lived in component state, so navigation lost price, amenities, and sort. Distance defaulted to zero, ratings to zero, and coordinates to city centers. Those values cannot substantiate distance or popularity filters or precise map pins.
- Messaging/review buttons were presented as usable, but `act` explicitly rejects these mutations. Remove these entry points and state the actual feature availability.
- Existing payment rules reject live Stripe keys and disable test checkout on production. Preserve this boundary, the 8% server-calculated service fee, and approval-before-payment workflow.
- `npm ci` failed on the baseline lockfile (AJV dependency mismatch). Regenerate the lockfile with the existing package requirements.

## Information architecture

| Journey           | Routes                                                                                            | Data/behavior                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Introduction      | `/`                                                                                               | Editorial brand message, working search, published inventory, real inventory counts                  |
| Discovery         | `/explore`                                                                                        | Activities, cities, and attribute-based collections                                                  |
| Activity          | `/explore/activity/{meetings,content,workshops,events}`                                           | Published listings matched by normalized activities                                                  |
| City              | `/explore/city/{city}`                                                                            | Published listings matched by city                                                                   |
| Collection        | `/explore/collection/{daylight,small-teams,easy-arrival}`                                         | Amenities or capacity predicates; no popularity claim                                                |
| Search            | `/search`                                                                                         | URL-based budget, amenities, type, date/time, capacity, sorting; map only with supplied coordinates  |
| Detail            | `/spaces/{id}`                                                                                    | Existing availability/reservation logic, gallery, rules, related real inventory                      |
| Transaction       | `/checkout`, existing `/checkout/test`                                                            | Existing quote, request, approval, and test payment integration                                      |
| Renter            | `/account/bookings`, `/account/saved`, `/account/payments`, `/account/profile`                    | Existing account logic with addressable sections                                                     |
| Host introduction | `/become-a-host`                                                                                  | Explains actual capabilities and preparation                                                         |
| Host management   | `/host`, `/host/listings`, `/host/bookings`, `/host/earnings`, `/host/calendar`, `/host/new`      | Existing listing wizard, booking response, calendar/pricing, test metrics                            |
| Help              | `/about`, `/how-it-works`, `/help`, `/faq`, `/trust-and-safety`, `/contact`, `/terms`, `/privacy` | Honest operational information; no invented support address, guarantees, or finalized legal policies |

All existing routes and `?tab=` account URLs remain supported. No database migrations, schema changes, payment API changes, or production deployment are included.

## Design foundation

Navy `#182d3d`, warm paper `#faf9f6`, white surfaces, neutral borders, restrained brass accent. Thai-first Noto Sans Thai and existing local fonts. Four-pixel spacing base, 1200px content grid, 8–10px component corners, low shadows, visible keyboard focus, reduced motion, native disclosure FAQs, labeled controls and skip navigation.

Activity/collection/hero photos are illustrative assets, not purported live inventory. Listing photos continue to come from actual published listing records. Next Image optimizes known local/storage images and preserves legacy external images without optimization; failed listing images display a clear fallback.

## Preservation boundary

Kept Supabase client and auth event handling, OAuth providers, safe login return paths, database queries and mutation permissions, server quote validation, booking RPC/mutations, calendar slot semantics, Stripe configuration and endpoints, and test-mode guards. New discovery uses existing published listing fields only. No new backend feature is claimed.

## Remaining product work before live transactions

Finalize legal/privacy policies and verified support channels, identity verification, production payment fulfilment/holds/webhooks/payouts, messaging and reviews. These are explicitly unavailable in the UI and are not silently simulated by this redesign.
