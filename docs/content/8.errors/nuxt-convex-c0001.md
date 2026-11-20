---
title: 'NUXT_CONVEX_C0001: The convex Better Auth database provider was removed'
description: 'Nuxt stopped loading because nuxt.config.ts sets auth.database.provider: ''convex''. That provider needed public, unauthenticated CRUD functions over your auth tables, so it was removed.'
navigation: false
---

Code: `NUXT_CONVEX_C0001`<br>
Level: error<br>
Package: `nuxt-convex`

## What this error means

Nuxt stopped loading because `nuxt.config.ts` sets `auth.database.provider: 'convex'`. That provider needed public, unauthenticated CRUD functions over your auth tables, so it was removed.

## Why this happens

- `auth.database.provider` is `'convex'` in `nuxt.config.ts`.
- Code still imports `createConvexHttpAdapter` from `nuxt-convex/better-auth`.

## How to fix it

Run Better Auth inside Convex with `@convex-dev/better-auth`, and let nuxt-convex proxy `/api/auth/**` to it:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@nuxtjs/better-auth', 'nuxt-convex'],
  auth: { clientOnly: true },
})
```

See [Better Auth](/integrations/better-auth#migrating-from-the-convex-database-provider) for the migration.
