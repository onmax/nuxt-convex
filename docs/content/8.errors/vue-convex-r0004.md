---
title: 'VUE_CONVEX_R0004: Convex HTTP client is not connected'
description: 'useConvexHttpClient() ran before the app had a Convex URL.'
navigation: false
---

Code: `VUE_CONVEX_R0004`<br>
Level: error<br>
Package: `vue-convex`

## What this error means

`useConvexHttpClient()` ran before the app had a Convex URL.

## Why this happens

- The app was installed without `url` and hasn't called `connect()` yet.

## How to fix it

Pass `url` to `app.use(convexVue, { url })`, or call `useConvexController().connect({ url })` first.
