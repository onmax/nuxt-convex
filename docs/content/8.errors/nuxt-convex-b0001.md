---
title: 'NUXT_CONVEX_B0001: Missing convex/_generated'
description: 'In development, the generated Convex directory does not exist, so #convex/api has no types and imports from it fail.'
navigation: false
---

Code: `NUXT_CONVEX_B0001`<br>
Level: warning<br>
Package: `nuxt-convex`

## What this error means

In development, the generated Convex directory does not exist, so `#convex/api` has no types and imports from it fail.

## Why this happens

- `npx convex dev` has not run in this project yet.
- Your Convex functions live outside the resolved `convex.dir`.

## How to fix it

Run `npx convex dev` in the project that owns the `convex/` directory. A running `nuxt dev` picks up the generated files without a restart. If your functions live in a layer or another folder, set `convex.dir`.
