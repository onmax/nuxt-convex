---
title: Nuxt Convex
description: Build with Convex in Nuxt or Vue with typed queries, SSR-aware realtime data, storage helpers, and integrations.
navigation: false
---

# Split the docs by runtime

Start in the track that matches your app. Nuxt docs stay module-first, while the Vue track also carries the shared composables and Convex patterns that both runtimes build on.

::div{class="flex flex-wrap gap-3"}
:u-button{to="/vue" label="Open Vue docs" trailing-icon="i-lucide-arrow-right"}
:u-button{to="/nuxt" label="Open Nuxt docs" color="neutral" variant="outline"}
::

::card-group

::card{title="Vue core + shared API" icon="i-lucide-component" to="/vue" color="primary"}
Work in a Vue-first track with plugin setup, manual initialization, composables, and the shared Convex patterns that the Nuxt module builds on.

:u-button{to="/vue" label="Open Vue docs" trailing-icon="i-lucide-arrow-right"}
::

::card{title="Nuxt module" icon="i-lucide-layers-3" to="/nuxt"}
Work in a Nuxt-first track with installation, guides, integrations, and module-specific behavior layered on top of the shared Vue package.

:u-button{to="/nuxt" label="Open Nuxt docs" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right"}
::

::

## What ships in this repo

- `packages/nuxt` owns the Nuxt module, aliases, auto-imports, renderless components, and runtime wiring.
- `packages/vue` owns the shared Vue plugin, composables, SSR query behavior, and storage helpers.
- the guides in this site stay tied to the real repo behavior instead of placeholder examples.

::important
The Nuxt module wraps the shared Vue package. Start with the track that matches your runtime, then use the Vue docs for the shared composables and Convex patterns available to both.
::
