---
title: 'VUE_CONVEX_R0008: Uploads are only available on the client'
description: 'useConvexUpload().upload() ran during server rendering. upload() returns null and passes this error to onError.'
navigation: false
---

Code: `VUE_CONVEX_R0008`<br>
Level: error<br>
Package: `vue-convex`

## What this error means

`useConvexUpload().upload()` ran during server rendering. `upload()` returns `null` and passes this error to `onError`.

## Why this happens

- `upload()` is called in `setup()`, or in code that also runs on the server.

## How to fix it

Call `upload()` from an event handler or `onMounted()`.
