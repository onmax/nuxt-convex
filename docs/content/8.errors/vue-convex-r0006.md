---
title: 'VUE_CONVEX_R0006: Storage feature is not configured'
description: 'useConvexStorage() or useConvexUpload() ran in an app without the storage plugin.'
navigation: false
---

Code: `VUE_CONVEX_R0006`<br>
Level: error<br>
Package: `vue-convex`

## What this error means

`useConvexStorage()` or `useConvexUpload()` ran in an app without the storage plugin.

## Why this happens

- In Vue, `convexVueStorage` is not installed.
- In Nuxt, `convex.storage` is off.

## How to fix it

In Nuxt, set `convex.storage: true`. In Vue, install `convexVueStorage` after `convexVue`:

```ts [main.ts]
import { convexVueStorage } from 'vue-convex/storage'

app.use(convexVueStorage, {
  generateUploadUrl: api.storage.generateUploadUrl,
  getUrl: api.storage.getUrl,
  remove: api.storage.remove,
})
```
