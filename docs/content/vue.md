---
title: Vue
description: The Vue-focused track for @onmax/convex-vue, centered on plugin setup, manual initialization, and shared composables.
navigation: false
---

Use this track when you want the shared `@onmax/convex-vue` package directly. It covers plugin setup, manual initialization, shared composables, and the Convex backend patterns that the Nuxt module builds on.

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
    Initialize the client later

    #description
    Delay client creation when the deployment URL or auth state only exists after app startup.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    to: /api-reference
    ---
    #title
    Browse the shared API

    #description
    Browse the shared composables, renderless components, Nuxt-only exports, and helpers that ship from this monorepo.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
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
- You can defer client initialization when your deployment URL is not known up front.
- The composables and helpers here are the same lower-level primitives used by the Nuxt module.

::important
If you are using Nuxt, you still need this track for the shared API and Convex backend patterns. The Nuxt docs focus on the wrapper layer, not on re-documenting the shared package.
::
