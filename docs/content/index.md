---
title: Nuxt Convex
description: Build with Convex in Nuxt or Vue with typed queries, SSR-aware realtime data, storage helpers, and integrations.
navigation: false
---

::u-page-hero
#title
Nuxt Convex

#description
Build with Convex in Nuxt or Vue with typed queries, SSR-aware realtime data, storage helpers, and integrations. Start in the runtime you are building, then move across tracks when you need lower-level API details or Nuxt-specific behavior.

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
This repo ships two layers: `@onmax/convex-vue` as the shared core and `nuxt-convex` as the Nuxt wrapper.

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
    Start with the shared package, installation flow, composables, and backend patterns that both runtimes rely on.
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
    Start with the Nuxt-specific module, runtime wiring, storage helpers, and integrations layered on top of the shared Vue package.
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
    Documents the shipped behavior in this monorepo instead of placeholder examples.
    ::::
  :::
::

::important
The Nuxt module wraps the shared Vue package. When a Nuxt page points you to shared composables or Convex backend behavior, continue in the Vue track.
::
