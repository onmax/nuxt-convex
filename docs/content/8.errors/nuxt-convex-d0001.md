---
title: 'NUXT_CONVEX_D0001: convex.server is deprecated'
description: 'nuxt.config.ts uses convex.server, the old name of convex.ssr. It still works, but it will be removed.'
navigation: false
---

Code: `NUXT_CONVEX_D0001`<br>
Level: deprecation<br>
Package: `nuxt-convex`

## What this error means

`nuxt.config.ts` uses `convex.server`, the old name of `convex.ssr`. It still works, but it will be removed.

## Why this happens

- A config written for nuxt-convex 0.0.7 or earlier.

## How to fix it

Rename the option:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  convex: { ssr: false }, // was: server: false
})
```

The per-query option keeps its name: `useConvexQuery(api.x, {}, { server: false })`.
