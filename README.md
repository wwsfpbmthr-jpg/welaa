# WELAA

Thai hourly-space marketplace built with Next.js, React, TypeScript, and Supabase.

## Development

Requires Node.js >=22.13.0.

```sh
npm ci
npm run dev
```

The existing Supabase client supports published listing reads and authenticated account, favorites, booking requests, and host availability workflows. Configure environment variables through the hosting provider; do not commit credentials.

## Validation

```sh
npx tsc --noEmit
node --test tests/*.test.mjs
npm run build
```

## Payments

No live payments are enabled. Existing server-side guards permit Stripe test keys only on approved non-production environments. Production must not be promoted until the owner approves the preview. Do not merge the redesign branch into main as part of preview validation.

See [WELAA 2.0 audit and architecture](docs/WELAA-2-AUDIT.md) for routes, preserved behavior, product limitations, and design decisions.
