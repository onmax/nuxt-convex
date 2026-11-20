---
title: 'NUXT_CONVEX_R0001: No Convex URL configured at run time'
description: 'In development, the Nuxt plugin started without a Convex URL. The runtime stays disconnected and queries stay pending.'
navigation: false
---

Code: `NUXT_CONVEX_R0001`<br>
Level: warning<br>
Package: `nuxt-convex`

## What this error means

In development, the Nuxt plugin started without a Convex URL. The runtime stays disconnected and queries stay `pending`.

## Why this happens

- No URL was found at build time, and `NUXT_PUBLIC_CONVEX_URL` is not set at run time.

## How to fix it

Set `CONVEX_URL` before `nuxt dev` or `nuxt build`, or `NUXT_PUBLIC_CONVEX_URL` at run time. In development, `npx convex dev` writes it to `.env.local`.
