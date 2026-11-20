---
title: 'NUXT_CONVEX_B0003: Scaffolding storage functions in the project instead of the layer'
description: 'The resolved Convex directory belongs to a layer the module cannot write to, so it reads functions from the layer and writes _hub/storage.ts into your project.'
navigation: false
---

Code: `NUXT_CONVEX_B0003`<br>
Level: warning<br>
Package: `nuxt-convex`

## What this error means

The resolved Convex directory belongs to a layer the module cannot write to, so it reads functions from the layer and writes `_hub/storage.ts` into your project.

## Why this happens

- `convex.dir` resolves to a layer inside `node_modules` or another read-only path.

## How to fix it

Set `convex.dir` to a writable project path:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  convex: { dir: 'convex' },
})
```
