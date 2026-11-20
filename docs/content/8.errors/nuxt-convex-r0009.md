---
title: 'NUXT_CONVEX_R0009: R2 uploads are only available on the client'
description: 'useConvexR2Upload().upload() ran during server rendering. upload() returns null and passes this error to onError.'
navigation: false
---

Code: `NUXT_CONVEX_R0009`<br>
Level: error<br>
Package: `nuxt-convex`

## What this error means

`useConvexR2Upload().upload()` ran during server rendering. `upload()` returns `null` and passes this error to `onError`.

## Why this happens

- `upload()` is called in `setup()`, or in code that also runs on the server.

## How to fix it

Call `upload()` from an event handler or `onMounted()`.
