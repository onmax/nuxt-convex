---
title: Nuxt
description: The Nuxt-focused track for nuxt-convex, with setup, guides, integrations, and module-specific API references.
navigation: false
---

Use this track when your app runs on Nuxt. It covers the `nuxt-convex` module, the public `#convex*` aliases, the Nuxt auto-imports, and the integrations that depend on Nuxt-specific runtime behavior.

Move into the Vue track when you need the shared composable semantics or the backend patterns that both runtimes consume.

::u-page-section
#title
Start in the Nuxt layer

#description
Follow these pages when you want module setup, runtime helpers, and Nuxt-specific integrations.

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /getting-started
    ---
    #title
    Install the module

    #description
    Install `nuxt-convex`, connect Convex, and generate the API used throughout the module and examples.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /nuxt-module
    ---
    #title
    Configure the wrapper

    #description
    Learn what the module adds for Nuxt app code, including aliases, auto-imports, runtime setup, and layer-aware resolution.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /integrations
    ---
    #title
    Add integrations

    #description
    Add Better Auth and Cloudflare R2 where the Nuxt module provides the surrounding wiring.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue
    ---
    #title
    Open the shared Vue layer

    #description
    Move into the shared package when you want composable details, manual plugin setup, or backend patterns that apply outside Nuxt.
    ::::
  :::
::

## Understand what the Nuxt layer owns

- `nuxt-convex` owns aliases, auto-imports, generated API access, and runtime wiring.
- File storage and Cloudflare R2 live here because they depend on module scaffolding and Nuxt runtime behavior.
- The shared query, mutation, pagination, auth, and controller behavior still lives in the Vue package.

::tip
Use the Vue track to learn shared composable behavior. Use the Nuxt track to learn the app-facing wrapper contract.
::
