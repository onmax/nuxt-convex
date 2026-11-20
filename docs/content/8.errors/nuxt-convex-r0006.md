---
title: 'NUXT_CONVEX_R0006: The Better Auth proxy has no Convex site URL'
description: 'A request reached the /api/auth/** proxy, but the module could not work out where Better Auth runs. The request answers 500.'
navigation: false
---

Code: `NUXT_CONVEX_R0006`<br>
Level: error<br>
Package: `nuxt-convex`

## What this error means

A request reached the `/api/auth/**` proxy, but the module could not work out where Better Auth runs. The request answers 500.

## Why this happens

- The Convex URL is a custom domain or a self-hosted backend, so the site URL cannot be derived from it. It is derived only from `*.convex.cloud` URLs and local backends.

## How to fix it

Set `CONVEX_SITE_URL` (or `convex.siteUrl`) at build time, or `NUXT_PUBLIC_CONVEX_SITE_URL` at run time:

```bash [.env]
CONVEX_SITE_URL=https://your-deployment.convex.site
```
