---
title: Nuxt Convex
description: Build with Convex in Nuxt or Vue with typed queries, SSR-aware realtime data, storage helpers, and integrations.
navigation: false
---

## ::u-page-hero

orientation: vertical
headline: Convex for Nuxt and Vue
title: Split the docs by runtime, not by package internals.
description: Start in the track that matches your app. Nuxt docs stay module-first, Vue docs stay plugin-first, and the shared API stays available when you need to cross the boundary.
links:

- label: Open Nuxt docs
  to: /nuxt
  trailingIcon: i-lucide-arrow-right
- label: Open Vue docs
  to: /vue
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
description: Work in a Nuxt-first track with installation, guides, integrations, and the module-aware API surface grouped together.
icon: i-lucide-layers-3
to: /nuxt
highlight: true
highlightColor: primary
spotlight: true

---

:u-button{to="/nuxt" label="Open Nuxt docs" trailing-icon="i-lucide-arrow-right"}
::

## ::u-page-card

title: Vue core
description: Work in a Vue-first track with plugin setup, manual initialization, and composable-oriented documentation.
icon: i-lucide-component
to: /vue
spotlight: true

---

:u-button{to="/vue" label="Open Vue docs" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right"}
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
