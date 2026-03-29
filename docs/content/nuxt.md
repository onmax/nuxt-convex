---
title: Nuxt
description: Use nuxt-convex in a Nuxt app for module setup, auto-imports, virtual modules, storage scaffolding, and Nuxt-side integrations.
navigation: false
---

Use this track when your app runs on Nuxt and you want the framework wrapper around the shared Vue runtime.

`nuxt-convex` owns the Nuxt-facing contract:

- module registration
- `#convex/*` aliases
- auto-imports
- generated API access through `#convex/api`
- optional storage scaffolding
- Nuxt-side Better Auth and Cloudflare R2 integrations

For shared composable behavior such as queries, mutations, pagination, and auth state, read the [Vue track](/vue). In a Nuxt app, keep the Nuxt import paths and aliases.

::u-page-section{orientation="vertical"}
#title
Start with the Nuxt path

#description
Open the page that matches your job: install the module, configure its public surface, or add a Nuxt-specific integration.

:::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
::::u-page-card
---
icon: i-lucide-download
spotlight: true
to: /getting-started/installation
---
#title
Install the module

#description
Add `nuxt-convex`, generate the API, and verify your first query.
::::

::::u-page-card
---
icon: i-lucide-settings
spotlight: true
to: /nuxt-module
---
#title
Configure the Nuxt layer

#description
Learn the module config, aliases, auto-imports, storage scaffolding, and wrapper-specific behavior.
::::

::::u-page-card
---
icon: i-lucide-plug
spotlight: true
to: /integrations
---
#title
Add integrations

#description
Wire Better Auth or Cloudflare R2 through the supported Nuxt-side entrypoints.
::::

::::u-page-card
---
icon: i-lucide-book-open-text
spotlight: true
to: /api-reference/module-configuration
---
#title
Look up the public API

#description
Check config keys, aliases, components, and the Nuxt-only upload helper.
::::

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
