---
title: Nuxt
description: Use nuxt-convex in a Nuxt app for server-rendered live queries, authenticated SSR, server helpers, auto-imports, storage and integrations.
navigation: false
---

Use this track when your app runs on Nuxt and you want the framework wrapper around the shared Vue runtime. Queries you `await` render on the server, hydrate from the payload, and then stay live over the WebSocket.

## Set up in three steps

::steps{level="3"}

### Install the module

```bash [Terminal]
pnpm add nuxt-convex convex
```

### Register it

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
})
```

### Query from a page

Run `npx convex dev` to create a deployment and generate `convex/_generated/`. The module reads the URL it writes to `.env.local`, so you can await your first query right away.

```vue [app/pages/index.vue]
<script setup lang="ts">
import { api } from '#convex/api'

const { data: tasks } = await useConvexQuery(api.tasks.list)
</script>
```

::

## What the module owns

`nuxt-convex` owns the Nuxt-facing contract:

- server rendering of awaited queries, hydrated from the payload
- the request's user on the server, through Better Auth or your own `convex:token` hook
- server helpers for Nitro routes, such as `serverConvexQuery` and `requireConvexAuth`
- `#convex/*` aliases, generated API access through `#convex/api`, and auto-imports
- optional storage scaffolding, and the Better Auth and Cloudflare R2 integrations

The composables themselves (queries, mutations, pagination, auth state) are shared with plain Vue; their guides live in the [Vue track](/vue). In a Nuxt app, keep the auto-imports and `#convex/*` aliases.

## Start with the Nuxt path

Open the page that matches your job.

::card-group
:::card
---
icon: i-lucide-server
to: /nuxt-module/ssr-and-hydration
title: Render on the server
---
How awaited queries render, hydrate, and stay live.
:::

:::card
---
icon: i-lucide-shield-check
to: /nuxt-module/authenticated-ssr
title: Render signed-in pages
---
Resolve the user's token on the server with Better Auth or your own provider.
:::

:::card
---
icon: i-lucide-route
to: /nuxt-module/server-routes
title: Call Convex from server routes
---
Run queries, mutations and actions as the request's user from Nitro.
:::

:::card
---
icon: i-lucide-book-open-text
to: /api-reference/module-configuration
title: Look up the public API
---
Check config keys, environment variables, aliases and runtime config.
:::
::

## What stays shared

The Nuxt module does not replace the shared data layer. These behaviors still come from the underlying Vue package:

- query and multi-query subscriptions
- mutations and actions
- paginated queries
- auth state primitives
- connection-state tracking
- the advanced controller and raw client helpers

## Next step

Open [Nuxt Module](/nuxt-module) for every guide, or [Deployment](/nuxt-module/deployment) when you're ready to ship.
