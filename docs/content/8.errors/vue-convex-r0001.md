---
title: 'VUE_CONVEX_R0001: Convex composables must be called inside setup()'
description: 'A Convex composable ran outside an injection context, so it cannot find the Convex client.'
navigation: false
---

Code: `VUE_CONVEX_R0001`<br>
Level: error<br>
Package: `vue-convex`

## What this error means

A Convex composable ran outside an injection context, so it cannot find the Convex client.

## Why this happens

- A `setTimeout` or another callback.
- A store defined outside the app.
- Code after an `await` in a plain (non-`<script setup>`) async function.

## How to fix it

Call composables in `setup()` or a plugin, or wrap the call in `app.runWithContext()` (`nuxtApp.runWithContext()` in Nuxt):

```ts
app.runWithContext(() => useConvexQuery(api.tasks.list, {}))
```
