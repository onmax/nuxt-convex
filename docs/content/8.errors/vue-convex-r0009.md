---
title: 'VUE_CONVEX_R0009: serverAuth.getToken() failed'
description: 'During server rendering, the serverAuth.getToken() passed to convexVue rejected. Authenticated SSR queries run anonymously instead.'
navigation: false
---

Code: `VUE_CONVEX_R0009`<br>
Level: error<br>
Package: `vue-convex`

## What this error means

During server rendering, the `serverAuth.getToken()` passed to `convexVue` rejected. Authenticated SSR queries run anonymously instead.

## Why this happens

- The token getter throws for anonymous requests instead of resolving `null`.
- The auth provider is unreachable.

## How to fix it

Resolve `null` instead of rejecting when there is no token:

```ts
app.use(convexVue, {
  url,
  serverAuth: { getToken: () => fetchToken().catch(() => null) },
})
```

The original error is logged with the diagnostic.
