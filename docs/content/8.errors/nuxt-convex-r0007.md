---
title: 'NUXT_CONVEX_R0007: Could not reach the Convex site URL'
description: 'The /api/auth/** proxy could not connect to the Convex site URL. The request answers 502.'
navigation: false
---

Code: `NUXT_CONVEX_R0007`<br>
Level: error<br>
Package: `nuxt-convex`

## What this error means

The `/api/auth/**` proxy could not connect to the Convex site URL. The request answers 502.

## Why this happens

- A wrong `siteUrl`.
- A local backend that isn't running.
- A network policy on the host.

## How to fix it

Open `<siteUrl>/api/auth/ok` directly. If it doesn't answer, fix the URL or start `npx convex dev`.
