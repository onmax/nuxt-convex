---
title: 'VUE_CONVEX_R0005: reconfigure() needs a Convex URL'
description: 'controller.reconfigure() was called while no URL is configured, so there is nothing to reconnect to.'
navigation: false
---

Code: `VUE_CONVEX_R0005`<br>
Level: error<br>
Package: `vue-convex`

## What this error means

`controller.reconfigure()` was called while no URL is configured, so there is nothing to reconnect to.

## Why this happens

- The controller was created without `url`, or `disconnect()` cleared it.

## How to fix it

Call `connect({ url })` first, or pass `url` to `reconfigure()`:

```ts
controller.reconfigure({ url: 'https://next.convex.cloud' })
```
