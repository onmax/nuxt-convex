---
title: Getting Started
description: Choose between the Nuxt module and the standalone Vue package, then generate the Convex API your app consumes.
---

Start here when you are choosing between the two runtime tracks. `nuxt-convex` is the Nuxt wrapper, while `@onmax/convex-vue` is the shared package underneath it.

::u-page-section
#title
Choose your runtime

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /nuxt-module
    ---
    #title
    Start with `nuxt-convex`

    #description
    Choose this track for Nuxt apps that need auto-imports, virtual modules, SSR-aware queries, storage scaffolding, and renderless components.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue-guide
    ---
    #title
    Start with `@onmax/convex-vue`

    #description
    Choose this track for standalone Vue 3 apps, custom runtimes, or setups where you want to install the plugin yourself.
    ::::
  :::
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

## What both tracks share

- `useConvexQuery`
- `useConvexQueries`
- `useConvexMutation`
- `useConvexAction`
- `useConvexPaginatedQuery`
- `useConvexAuth`
- `useConvexConnectionState`

Optional capabilities stay on explicit entrypoints:

- `@onmax/convex-vue/storage` for `useConvexStorage` and `useConvexUpload`
- `@onmax/convex-vue/advanced` for `useConvexController`, `useConvexClient`, and `useConvexHttpClient`

The Nuxt module layers aliases, auto-imports, renderless components, and optional integrations on top of that shared core.

## Next steps

- Follow the [installation guide](/getting-started/installation) to install the right package.
- Read [Nuxt Module](/nuxt-module) if you are working in Nuxt.
- Read [Vue Guide](/vue-guide) if you are wiring Convex into a standalone Vue app.
