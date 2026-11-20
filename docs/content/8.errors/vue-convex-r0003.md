---
title: 'VUE_CONVEX_R0003: Convex realtime client is not connected'
description: 'A mutation, action, storage call or useConvexClient() ran without a browser client.'
navigation: false
---

Code: `VUE_CONVEX_R0003`<br>
Level: error<br>
Package: `vue-convex`

## What this error means

A mutation, action, storage call or `useConvexClient()` ran without a browser client.

## Why this happens

- It ran during SSR, where there is no WebSocket client.
- The app was installed without `url` and hasn't called `connect()` yet.

## How to fix it

Call mutations and actions from event handlers, not during setup on the server. In server routes, use [`serverConvexMutation`](/nuxt-module/server-routes). In Vue, connect first:

```ts
useConvexController().connect({ url })
```

Queries don't throw in this state: they stay `pending` until a client connects.
