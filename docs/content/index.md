---
title: Nuxt Convex
description: Build with Convex in Nuxt or Vue with typed queries, SSR-aware realtime data, storage helpers, and integrations.
navigation: false
---

## ::u-page-hero

orientation: vertical
headline: Convex for Nuxt and Vue
title: Ship realtime apps without rebuilding the same integration twice.
description: nuxt-convex adds Nuxt-specific wiring on top of @onmax/convex-vue, while the Vue package stays available for standalone apps and custom runtimes.
links:

- label: Use the Nuxt module
  to: /nuxt-module
  trailingIcon: i-lucide-arrow-right
- label: Use the standalone Vue package
  to: /vue-core
  color: neutral
  variant: outline
- label: Browse the API reference
  to: /api-reference
  color: neutral
  variant: ghost

---

::

::u-page-grid

## ::u-page-card

title: Nuxt module
description: Add auto-imports, virtual modules, SSR-aware queries, storage scaffolding, and DevTools integration to a Nuxt app.
icon: i-lucide-layers-3
to: /nuxt-module
highlight: true
highlightColor: primary
spotlight: true

---

:u-button{to="/getting-started/installation" label="Install nuxt-convex" trailing-icon="i-lucide-arrow-right"}
::

## ::u-page-card

title: Vue core
description: Use the same Convex composables directly in Vue 3 with manual or automatic client initialization.
icon: i-lucide-component
to: /vue-core
spotlight: true

---

:u-button{to="/vue-core/installation" label="Install @onmax/convex-vue" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right"}
::

## ::u-page-card

title: API reference
description: Review every shipped composable, renderless component, module option, and virtual module from the current public surface.
icon: i-lucide-book-open-text
to: /api-reference
spotlight: true

---

:u-button{to="/api-reference" label="Open the reference" color="neutral" variant="ghost" trailing-icon="i-lucide-arrow-right"}
::

::

## ::u-page-section

title: What ships in this repo
description: The documentation follows the actual monorepo layout so examples stay aligned with the published packages.
orientation: vertical

---

::u-page-grid

## ::u-page-feature

title: `packages/nuxt`
description: The Nuxt module resolves `#convex`, `#convex/api`, optional storage and R2 helpers, and auto-imports the composables you use in app code.
icon: i-lucide-box

---

::

## ::u-page-feature

title: `packages/vue`
description: The Vue package owns the shared composables, plugin state, SSR query behavior, and storage helpers that both tracks document.
icon: i-lucide-file-code-2

---

::

## ::u-page-feature

title: Repo-backed guides
description: Storage, R2, Better Auth, and renderless component guides now reference the real behavior exposed by this repository instead of placeholder examples.
icon: i-lucide-badge-check

---

::

::

::important
The Nuxt module and the Vue package are equally supported. Start with the track that matches your runtime, then move into the shared Convex patterns and API reference.
::
