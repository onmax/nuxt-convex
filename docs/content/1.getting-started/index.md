---
title: Getting Started
description: Choose between the Nuxt module and the standalone Vue package, then generate the Convex API your app consumes.
---

Nuxt Convex ships as two packages in one repo. `nuxt-convex` is the Nuxt-specific integration layer. `@onmax/convex-vue` is the shared Vue plugin and composables that power both tracks.

::card-group

::card{title="Start with `nuxt-convex`" icon="i-lucide-layers-3" to="/nuxt-module" color="primary"}
Pick this track for Nuxt apps that need auto-imports, virtual modules, SSR-aware queries, storage scaffolding, and renderless components.
::

::card{title="Start with `@onmax/convex-vue`" icon="i-lucide-component" to="/vue-core"}
Pick this track for standalone Vue 3 apps, custom runtimes, or setups where you want to install the plugin yourself.
::

::

## Shared prerequisites

Both tracks assume the same Convex backend workflow.

::steps

### Create or connect a Convex project

Run `npx convex dev` in your app to create a deployment or connect an existing project.

### Keep the generated files in your Convex directory

The docs reference generated imports such as `./_generated/server` and `#convex/api`. Those only exist after Convex has generated types for your project.

### Set a deployment URL for the frontend

Both packages read a Convex deployment URL. The Nuxt module can read `CONVEX_URL` or `NUXT_PUBLIC_CONVEX_URL`. The Vue plugin receives the URL through its install options.
::

## What is shared

- `useConvexQuery`
- `useConvexMutation`
- `useConvexAction`
- `useConvexClient`
- `useConvexPaginatedQuery`
- `useConvexStorage`
- `useConvexUpload`

The Nuxt module layers aliases, auto-imports, renderless components, and optional integrations on top of that shared core.

## Next steps

- Follow the [installation guide](/getting-started/installation) to install the right package.
- Read [Nuxt Module](/nuxt-module) if you are working in Nuxt.
- Read [Vue Core](/vue-core) if you are wiring Convex into a standalone Vue app.
