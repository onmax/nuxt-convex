---
title: Nuxt Convex
description: Realtime Vue & Nuxt apps powered by Convex. Type-safe queries, SSR-aware subscriptions, file storage, and auth — works standalone or as a Nuxt module.
navigation: false
---

::u-page-hero{class="hero-glow"}
#headline
Open-Source Convex SDK

#title
Realtime Vue & Nuxt, :br powered by Convex

#description
Type-safe queries, SSR-aware subscriptions, and storage helpers for Vue and Nuxt. One composable layer — two integration paths.

#links
:u-button{to="/getting-started" size="xl" trailing-icon="i-lucide-arrow-right" label="Get started"}
:u-button{to="https://github.com/onmax/nuxt-convex" target="_blank" size="xl" color="neutral" variant="outline" trailing-icon="i-simple-icons-github" label="View on GitHub"}

#body
  :::code-group{class="max-w-md mx-auto"}
  ```bash [Nuxt]
  npx nuxi module add nuxt-convex
  ```
  ```bash [Vue]
  npm install @onmax/convex-vue
  ```
  :::
::

::u-page-section{orientation="vertical"}
#title
Choose your path

#description
The same composables power both packages. Pick the one that matches your stack.

  :::u-page-grid{class="max-w-3xl mx-auto !grid-cols-1 sm:!grid-cols-2 !gap-6 text-center"}
  ::::u-page-card
  ---
  icon: i-simple-icons-vuedotjs
  spotlight: true
  to: /vue
  ---
  #title
  Vue standalone

  #description
  Drop into any Vue 3 app. Full control over plugin setup, queries, mutations, pagination, and file storage. No framework lock-in.
  ::::

  ::::u-page-card
  ---
  icon: i-simple-icons-nuxtdotjs
  spotlight: true
  to: /nuxt
  ---
  #title
  Nuxt module

  #description
  Auto-imports, `#convex` virtual modules, file storage helpers, Cloudflare R2, and Better Auth. Everything wired for you.
  ::::
  :::
::

::u-page-section{orientation="vertical"}
#title
See it in action

#description
Define your schema, use a composable, get realtime data. That's it.

#default
:landing-realtime-preview
::

::u-page-section{orientation="vertical"}
#title
Built for realtime apps

#description
Everything you need to build reactive, type-safe applications with Convex.

  :::u-page-grid{class="max-w-5xl mx-auto !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-4 text-center"}
  ::::u-page-card
  ---
  icon: i-lucide-radio
  ---
  #title
  Realtime subscriptions

  #description
  Data stays fresh without polling. Convex pushes updates to your components automatically.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-server
  ---
  #title
  SSR out of the box

  #description
  Server-fetch on first load, client-subscribe after hydration. No layout shift, no loading spinners.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-braces
  ---
  #title
  End-to-end types

  #description
  Your Convex schema flows all the way to your `<template>`. Autocomplete and type errors at every layer.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-hard-drive
  ---
  #title
  File storage

  #description
  Upload files and generate reactive URLs. Nuxt module adds Cloudflare R2 support on top.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-list
  ---
  #title
  Pagination

  #description
  Cursor-based pagination with infinite scroll. Realtime updates across all loaded pages.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-lock
  ---
  #title
  Auth integration

  #description
  Built-in Better Auth support. Or wire any provider through the auth adapter interface.
  ::::
  :::
::

::u-page-section{orientation="vertical"}
#title
How it works

  :::u-page-grid{class="max-w-4xl mx-auto !grid-cols-1 sm:!grid-cols-3 !gap-6 text-center"}
  ::::u-page-card
  ---
  icon: i-lucide-database
  ---
  #title
  1. Define your backend

  #description
  Write schema and functions in `convex/`. Types are generated automatically.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-download
  ---
  #title
  2. Install the SDK

  #description
  Add the Nuxt module or the Vue plugin. One command, reactivity wired for you.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-code
  ---
  #title
  3. Use composables

  #description
  Call `useConvexQuery` and friends. Data flows realtime, fully typed.
  ::::
  :::
::

::u-page-section{orientation="vertical" class="landing-section-alt"}
#title
What the Nuxt module adds

#description
Everything in the Vue package, plus framework-level integrations.

  :::u-page-grid{class="max-w-3xl mx-auto !grid-cols-1 sm:!grid-cols-2 !gap-4 text-center"}
  ::::u-page-card
  ---
  icon: i-lucide-hash
  ---
  #title
  Virtual modules

  #description
  Import from `#convex`, `#convex/advanced`, and `#convex/storage`. Auto-imported, tree-shakeable.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-cloud
  ---
  #title
  Cloudflare R2

  #description
  Upload to R2 with metadata synced through Convex. Built on NuxtHub and the storage composable.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-shield
  ---
  #title
  Better Auth

  #description
  Database adapter, session hooks, and auth state wired into the Convex client. Drop-in provider support.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-zap
  ---
  #title
  Zero config

  #description
  Auto-detects your Convex deployment URL, registers composables, and configures SSR. Just add the module.
  ::::
  :::
::

::u-page-section{orientation="vertical"}
#title
Ready to build?

#description
Pick your framework and start shipping realtime features in minutes.

#links
:u-button{to="/getting-started" size="xl" label="Nuxt quickstart" trailing-icon="i-lucide-arrow-right"}
:u-button{to="/vue-guide/installation" size="xl" color="neutral" variant="outline" label="Vue quickstart" trailing-icon="i-lucide-arrow-right"}
::
