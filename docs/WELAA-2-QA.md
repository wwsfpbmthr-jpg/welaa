# WELAA 2.0 verification

Date: 10 October 2026. Feature branch only; no production merge or deployment.

## Automated checks

- `npx tsc --noEmit`: passed.
- ESLint on `app/experience` TypeScript modules: passed.
- `npm run build`: passed, Next.js 16.3.4.
- `node --test tests/*.test.mjs`: 16 passed. Covers server quote validation, hourly satang pricing and 8% fee, invalid/unpublished selections, payment state/idempotency, safe login returns, Stripe server totals and production/live-key guards.
- No changes to `app/api` or `lib` against baseline.

## Browser verification on protected Vercel Preview

- Homepage, Explore, Search, host introduction, Help, signed-out account/bookings and login checked at actual embedded viewport widths 375, 390, 768, 1024 and 1440px. The preview-only review workspace measures `window.innerWidth` and document scroll width. No horizontal overflow reported at those 35 route/width combinations. This is a layout check, not an authenticated transaction test.
- Search budget 200–1000 and Wi-Fi filtering updated the URL. Editing guest count to 5 retained those filters.
- Desktop navigation to Search and Explore worked; activity, collection and city links resolve to dedicated routes.
- Help search for cancellation reduced results to the matching question; native disclosure expanded its answer.
- Supabase schema/status read-only audit confirmed existing tables and RLS. Seven listings are archived, with zero published inventory. Empty discovery/search states are therefore expected; no inventory was fabricated or republished.
- Homepage hero removed after visual review. Search remains fully functional and activity discovery stays below it.

## Limits and release follow-up

There is no authenticated test account or published inventory available for full end-to-end booking, favorites, listing creation, host response, calendar changes or Stripe test checkout verification. These existing business handlers and payment/API modules are retained, with automated guard tests passing. The release still needs an authorized test account and published test listing to run those complete journeys.

No automated accessibility audit, screen-reader session, mobile Safari device run or Lighthouse score is claimed. Labels, visible focus, skip navigation, reduced motion, semantic disclosures and mobile navigation were implemented; further device and assistive-technology testing remains appropriate.

Terms/privacy pages describe current capabilities and explicitly disclose unfinished policies. Legal documents and support channels require business review before live transactions. Legacy transaction CSS remains alongside the new shared design system and can be migrated incrementally.
