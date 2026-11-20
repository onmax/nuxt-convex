---
title: 'VUE_CONVEX_R0002: Convex is not installed on this app'
description: 'A Convex composable ran in an app that never installed the convexVue plugin.'
navigation: false
---

Code: `VUE_CONVEX_R0002`<br>
Level: error<br>
Package: `vue-convex`

## What this error means

A Convex composable ran in an app that never installed the `convexVue` plugin.

## Why this happens

- `app.use(convexVue, ...)` is missing.
- The composable runs in another Vue app, for example a component mounted with its own `createApp()`.

## How to fix it

Install the plugin before mounting:

```ts [main.ts]
import { convexVue } from 'vue-convex'

createApp(App).use(convexVue, { url: import.meta.env.VITE_CONVEX_URL }).mount('#app')
```
