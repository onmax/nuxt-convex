---
title: 'NUXT_CONVEX_R0003: Failed to load storage refs from the generated Convex API'
description: 'convex.storage is on, but the generated API has no _hub/storage functions, so useConvexStorage and useConvexUpload are not installed.'
navigation: false
---

Code: `NUXT_CONVEX_R0003`<br>
Level: warning<br>
Package: `nuxt-convex`

## What this error means

`convex.storage` is on, but the generated API has no `_hub/storage` functions, so `useConvexStorage` and `useConvexUpload` are not installed.

## Why this happens

- `convex/_generated` is older than `convex/_hub/storage.ts`.
- `npx convex dev` failed to push the storage functions.

## How to fix it

Run `npx convex dev` so `convex/_generated/api` includes `_hub/storage`, then reload the page.
