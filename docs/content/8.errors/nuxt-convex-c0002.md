---
title: 'NUXT_CONVEX_C0002: Convex URL not configured'
description: 'In development, the module found no Convex deployment URL. The app starts disconnected and every query stays pending.'
navigation: false
---

Code: `NUXT_CONVEX_C0002`<br>
Level: warning<br>
Package: `nuxt-convex`

## What this error means

In development, the module found no Convex deployment URL. The app starts disconnected and every query stays `pending`.

## Why this happens

- `npx convex dev` has not run yet, so `.env.local` has no `CONVEX_URL`.
- None of `convex.url`, `CONVEX_URL`, `NUXT_PUBLIC_CONVEX_URL` or `VITE_CONVEX_URL` is set.

## How to fix it

Run `npx convex dev`, which writes `CONVEX_URL` to `.env.local`, or set the URL yourself:

```bash [.env]
CONVEX_URL=https://your-deployment.convex.cloud
```

See [Local Development](/getting-started/local-development#environment-variables).
