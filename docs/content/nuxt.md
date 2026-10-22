---
title: Nuxt
description: Use nuxt-convex in a Nuxt app for module setup, auto-imports, virtual modules, storage scaffolding, and Nuxt-side integrations.
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

Run `npx convex dev` to generate `convex/_generated/`, set `CONVEX_URL` in `.env`, and await your first query.

```vue [app/pages/index.vue]
<script setup lang="ts">
import { api } from '#convex/api'

const { data: tasks } = await useConvexQuery(api.tasks.list)
</script>
```

::

## What the module owns

`nuxt-convex` owns the Nuxt-facing contract:

- module registration
- `#convex/*` aliases
- auto-imports
- generated API access through `#convex/api`
- optional storage scaffolding
- Nuxt-side Better Auth and Cloudflare R2 integrations

For shared composable behavior such as queries, mutations, pagination, and auth state, read the [Vue track](/vue). In a Nuxt app, keep the Nuxt import paths and aliases.

## Start with the Nuxt path

Open the page that matches your job: install the module, configure its public surface, or add a Nuxt-specific integration.

::card-group
:::card
---
icon: i-lucide-download
to: /getting-started/installation
title: Install the module
---
Add `nuxt-convex`, generate the API, and verify your first query.
:::

:::card
---
icon: i-lucide-settings
to: /nuxt-module
title: Configure the Nuxt layer
---
Learn the module config, aliases, auto-imports, storage scaffolding, and wrapper-specific behavior.
:::

:::card
---
icon: i-lucide-plug
to: /integrations
title: Add integrations
---
Wire Better Auth or Cloudflare R2 through the supported Nuxt-side entrypoints.
:::

:::card
---
icon: i-lucide-book-open-text
to: /api-reference/module-configuration
title: Look up the public API
---
Check config keys, aliases, components, and the Nuxt-only upload helper.
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

Open [Nuxt Module](/nuxt-module) for the wrapper contract, or go straight to [Integrations](/integrations) if you already have the core module installed.
