---
title: Nuxt Convex
description: Build with Convex in Nuxt or Vue with typed queries, SSR-aware realtime data, storage helpers, and documented integration paths.
navigation: false
---

::u-page-hero
#title
Nuxt Convex

#description
Build with Convex in Nuxt or Vue with typed queries, SSR-aware realtime data, storage helpers, and documented integration paths. Start in the runtime you are shipping, then cross into the other track only when you need the shared lower layer or a Nuxt-specific wrapper detail.

#links
  :::u-button
  ---
  color: neutral
  size: xl
  to: /vue
  trailing-icon: i-lucide-arrow-right
  ---
  Open Vue docs
  :::

  :::u-button
  ---
  color: neutral
  size: xl
  to: /nuxt
  variant: outline
  ---
  Open Nuxt docs
  :::
::

::u-page-section
#title
Choose your track

#description
This repo ships two product layers: `@onmax/convex-vue` as the standalone Vue package and `nuxt-convex` as the Nuxt wrapper around that shared runtime.

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue
    ---
    #title
    Vue core + shared API

    #description
    Start here for the standalone Vue package, shared composables, and backend patterns that both runtimes rely on.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /nuxt
    ---
    #title
    Nuxt module

    #description
    Start here for the Nuxt-specific module, public `#convex*` aliases, auto-imports, storage helpers, and integrations.
    ::::
  :::
::

::u-page-section
#title
Understand the monorepo

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 md:col-span-1
    spotlight: true
    ---
    #title
    `packages/vue`

    #description
    Owns the shared Vue plugin, composables, SSR query behavior, and storage helpers.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 md:col-span-1
    spotlight: true
    ---
    #title
    `packages/nuxt`

    #description
    Owns the Nuxt module, aliases, auto-imports, renderless components, and runtime wiring.
    ::::

    ::::u-page-card
    ---
    class: col-span-2
    spotlight: true
    ---
    #title
    `docs`

    #description
    Documents the shipped behavior in this monorepo instead of placeholder or speculative examples.
    ::::
  :::
::

::important
The Nuxt track documents the wrapper contract. The Vue track documents the shared runtime and backend patterns underneath it.
::
