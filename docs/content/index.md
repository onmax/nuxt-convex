---
title: Nuxt Convex
description: Realtime Convex helpers for Nuxt and Vue. Choose the track that matches your app, then install the shared data layer with the right framework wiring.
navigation: false
---

::u-page-hero{class="hero-glow"}

#title
Convex for Nuxt and Vue

#description
Build realtime apps with typed queries, mutations, pagination, storage helpers, and framework-specific setup for Nuxt or standalone Vue.

#links
:u-button{to="/getting-started" size="xl" trailing-icon="i-lucide-arrow-right" label="Get started"}
:u-button{to="https://github.com/onmax/nuxt-convex" target="_blank" size="xl" color="neutral" variant="outline" trailing-icon="i-simple-icons-github" label="View on GitHub"}

#body
  :::code-group{class="landing-install-command max-w-md mx-auto"}
  ```bash [Nuxt]
  pnpm add nuxt-convex convex
  ```
  ```bash [Vue]
  pnpm add vue-convex convex
  ```
  :::
::

::u-page-section{orientation="vertical"}
#title
Choose your starting path

#description
Both packages share the same Convex runtime model. Pick the entrypoint that matches your app and follow that track.

  :::u-page-grid{class="max-w-3xl mx-auto !grid-cols-1 sm:!grid-cols-2 !gap-6"}
  ::::u-page-card
  ---
  icon: i-simple-icons-nuxtdotjs
  spotlight: true
  to: /nuxt
  ---
  #title
  Nuxt track

  #description
  Use `nuxt-convex` for module setup, auto-imports, `#convex/*` aliases, storage scaffolding, and Nuxt-side integrations.
  ::::

  ::::u-page-card
  ---
  icon: i-simple-icons-vuedotjs
  spotlight: true
  to: /vue
  ---
  #title
  Vue track

  #description
  Use `vue-convex` directly in a Vue 3 app when you want explicit plugin setup and full runtime control.
  ::::
  :::
::

::u-page-section{orientation="vertical"}
#title
What you get

#description
The two tracks differ in setup, but they share the same app-facing data model.

  :::u-page-grid{class="max-w-5xl mx-auto !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-4"}
  ::::u-page-card
  ---
  icon: i-lucide-radio
  ---
  #title
  Realtime queries

  #description
  Subscribe to Convex data and keep it fresh without polling.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-server
  ---
  #title
  SSR-aware reads

  #description
  Use HTTP for the initial server render, then attach realtime updates on the client.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-braces
  ---
  #title
  Typed APIs

  #description
  Consume Convex generated types directly from your app code.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-list
  ---
  #title
  Pagination helpers

  #description
  Load page-by-page feeds with reset and incremental load helpers.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-hard-drive
  ---
  #title
  Storage helpers

  #description
  Upload files to Convex storage or Cloudflare R2, depending on your setup.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-lock
  ---
  #title
  Auth primitives

  #description
  Track auth state in the shared runtime and wire Nuxt-side auth integrations when needed.
  ::::
  :::
::

::u-page-section{orientation="vertical"}
#title
Read by intent

  :::u-page-grid{class="max-w-4xl mx-auto !grid-cols-1 sm:!grid-cols-2 !gap-4"}
  ::::u-page-card
  ---
  icon: i-lucide-rocket
  to: /getting-started
  ---
  #title
  First successful run

  #description
  Start here if you are new to the repo and want the shortest path to a working setup.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-puzzle
  to: /convex-patterns
  ---
  #title
  Shared backend patterns

  #description
  Learn the Convex schema, function, and SSR assumptions both tracks rely on.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-book-open-text
  to: /api-reference
  ---
  #title
  API reference

  #description
  Look up exact config keys, aliases, composable signatures, and component behavior.
  ::::

  ::::u-page-card
  ---
  icon: i-lucide-life-buoy
  to: /troubleshooting
  ---
  #title
  Troubleshooting

  #description
  Diagnose missing generated files, auth-sensitive SSR issues, storage setup, and connection problems.
  ::::
  :::
::

::u-page-section{orientation="vertical"}
#title
Next step

#description
Open the getting-started page to choose the right package and verify your first query.

#links
:u-button{to="/getting-started" size="xl" label="Open getting started" trailing-icon="i-lucide-arrow-right"}
::
