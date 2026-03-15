---
title: Vue
description: The Vue-focused track for @onmax/convex-vue, centered on the root data-layer API plus the /advanced and /storage feature entrypoints.
navigation: false
---

Use this track when you want the shared `@onmax/convex-vue` package directly. It covers plugin setup, the advanced controller entrypoint, the storage feature entrypoint, and the Convex backend patterns that the Nuxt module builds on.

This is also the reference track for the shared API surface. Nuxt users should come here whenever they want to understand the lower layer beneath the module.

::u-page-section
#title
Start in the shared layer

#description
Follow these pages when you want the underlying package, the shared API, and the Convex backend patterns that both runtimes call into.

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue-core/installation
    ---
    #title
    Install the Vue package

    #description
    Install `@onmax/convex-vue`, register the plugin, and connect a Convex deployment URL during app startup.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue-core/manual-initialization
    ---
    #title
    Connect later with /advanced

    #description
    Delay connection when the deployment URL only exists after app startup.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /api-reference
    ---
    #title
    Browse the shared API

    #description
    Browse the root data-layer API plus the `/advanced` and `/storage` entrypoints.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /convex-patterns
    ---
    #title
    Follow Convex patterns

    #description
    Review schema, function, and realtime patterns from the perspective of the shared layer that both runtimes call into.
    ::::
  :::
::

## Understand what this track covers

- Vue apps install and configure `convexVue` directly, which makes runtime control explicit.
- You can connect later through `@onmax/convex-vue/advanced` when your deployment URL is not known up front.
- Optional file helpers live in `@onmax/convex-vue/storage`.
- The core data composables here are the same lower-level primitives used by the Nuxt module.

::important
If you are using Nuxt, you still need this track for the shared API and Convex backend patterns. The Nuxt docs focus on the wrapper layer, not on re-documenting the shared package.
::
