---
title: Getting Started
description: Choose between the Nuxt module and the standalone Vue package, then generate the Convex API your app consumes.
---

Start here when you are choosing between the two runtime tracks. `nuxt-convex` is the Nuxt wrapper, while `@onmax/convex-vue` is the standalone Vue package and shared lower layer.

::u-page-section{align="left"}
#title
Choose your runtime

  :::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
    ::::u-page-card
    ---
    icon: i-simple-icons-nuxtdotjs
    spotlight: true
    to: /nuxt-module
    ---
    #title
    Start with `nuxt-convex`

    #description
    Auto-imports, virtual modules, SSR queries, and storage.
    ::::

    ::::u-page-card
    ---
    icon: i-simple-icons-vuedotjs
    spotlight: true
    to: /vue-guide
    ---
    #title
    Start with `@onmax/convex-vue`

    #description
    Standalone Vue 3 with full plugin control.
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

Optional capabilities stay on explicit Vue entrypoints:

- `@onmax/convex-vue/storage` for `useConvexStorage` and `useConvexUpload`
- `@onmax/convex-vue/advanced` for `useConvexController`, `useConvexClient`, and `useConvexHttpClient`

In Nuxt, the module exposes that same core through `#convex`, `#convex/advanced`, optional `#convex/storage`, and Nuxt auto-imports.

## Next steps

- Follow the [installation guide](/getting-started/installation) to install the right package.
- Read [Nuxt Module](/nuxt-module) if you are working in Nuxt.
- Read [Vue Guide](/vue-guide) if you are wiring Convex into a standalone Vue app.
