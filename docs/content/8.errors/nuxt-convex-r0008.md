---
title: 'NUXT_CONVEX_R0008: Convex realtime client is not connected (R2 upload)'
description: 'useConvexR2Upload().upload() ran without a browser Convex client. upload() returns null and passes this error to onError.'
navigation: false
---

Code: `NUXT_CONVEX_R0008`<br>
Level: error<br>
Package: `nuxt-convex`

## What this error means

`useConvexR2Upload().upload()` ran without a browser Convex client. `upload()` returns `null` and passes this error to `onError`.

## Why this happens

- The app has no Convex URL yet.
- The upload ran before the client connected.

## How to fix it

Configure the Convex URL, and call `upload()` from the browser, for example in an event handler.
