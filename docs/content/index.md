---
title: Nuxt Convex
description: Build with Convex in Nuxt or Vue with typed queries, SSR-aware realtime data, storage helpers, and integrations.
navigation: false
---

# Split the docs by runtime

Start in the track that matches your app. Nuxt docs stay module-first, Vue docs stay plugin-first, and the shared API stays available when you need to cross the boundary.

:u-button{to="/nuxt" label="Open Nuxt docs" trailing-icon="i-lucide-arrow-right"}
:u-button{to="/vue" label="Open Vue docs" color="neutral" variant="outline"}
:u-button{to="/api-reference" label="Browse the API reference" color="neutral" variant="ghost"}

::card-group

::card{title="Nuxt module" icon="i-lucide-layers-3" to="/nuxt" color="primary"}
Work in a Nuxt-first track with installation, guides, integrations, and the module-aware API surface grouped together.

:u-button{to="/nuxt" label="Open Nuxt docs" trailing-icon="i-lucide-arrow-right"}
::

::card{title="Vue core" icon="i-lucide-component" to="/vue"}
Work in a Vue-first track with plugin setup, manual initialization, and composable-oriented documentation.

:u-button{to="/vue" label="Open Vue docs" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right"}
::

::card{title="API reference" icon="i-lucide-book-open-text" to="/api-reference"}
Review every shipped composable, renderless component, module option, and virtual module from the current public surface.

:u-button{to="/api-reference" label="Open the reference" color="neutral" variant="ghost" trailing-icon="i-lucide-arrow-right"}
::

::

## What ships in this repo

- `packages/nuxt` owns the Nuxt module, aliases, auto-imports, renderless components, and runtime wiring.
- `packages/vue` owns the shared Vue plugin, composables, SSR query behavior, and storage helpers.
- the guides in this site stay tied to the real repo behavior instead of placeholder examples.

::important
The Nuxt module and the Vue package are equally supported. Start with the track that matches your runtime, then move into the shared Convex patterns and API reference.
::
