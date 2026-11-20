---
title: 'NUXT_CONVEX_R0002: Resolving the Convex token failed'
description: 'During server rendering, the request''s token resolver threw. The page renders signed out instead of failing.'
navigation: false
---

Code: `NUXT_CONVEX_R0002`<br>
Level: error<br>
Package: `nuxt-convex`

## What this error means

During server rendering, the request's token resolver threw. The page renders signed out instead of failing.

## Why this happens

- A `convex:token` hook threw.
- A custom auth provider's token lookup threw instead of returning `null`.

## How to fix it

Make the `convex:token` hook return `null` for anonymous requests instead of throwing:

```ts [server/plugins/convex-token.ts]
import { useServerHooks } from 'nuxt/server'

export default defineNitroPlugin(() => {
  useServerHooks().hook('convex:token', async (event, ctx) => {
    ctx.token = await getTokenFromYourProvider(event).catch(() => null)
  })
})
```

The original error is logged with the diagnostic.
