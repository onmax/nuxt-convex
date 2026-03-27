---
title: Vue
description: Use @onmax/convex-vue directly in any Vue 3 app for realtime data, mutations, pagination, and file storage.
navigation: false
---

Use `@onmax/convex-vue` in any Vue 3 app — no Nuxt required. This track covers plugin setup, queries, mutations, pagination, file storage, and the runtime controller.

Nuxt users: this is also the shared runtime underneath `nuxt-convex`. Read it to understand composable behavior; your import paths stay the same.

::u-page-section{orientation="vertical"}
#title
Start with the Vue package

#description
Follow the guides in order, or jump to the topic you need.

:::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
::::u-page-card
---
icon: i-lucide-download
spotlight: true
to: /vue-guide/installation
---
#title
Installation

#description
Install the plugin and verify with a first query.
::::

::::u-page-card
---
icon: i-lucide-search
spotlight: true
to: /vue-guide/queries
---
#title
Queries

#description
Reactive subscriptions with SSR and realtime updates.
::::

::::u-page-card
---
icon: i-lucide-pen-line
spotlight: true
to: /vue-guide/mutations-and-actions
---
#title
Mutations & Actions

#description
Write data and run server-side logic.
::::

::::u-page-card
---
icon: i-lucide-list
spotlight: true
to: /vue-guide/pagination
---
#title
Pagination

#description
Cursor-based pagination and infinite scroll.
::::

::::u-page-card
---
icon: i-lucide-hard-drive
spotlight: true
to: /vue-guide/file-storage
---
#title
File Storage

#description
Upload files and display with reactive URLs.
::::

::::u-page-card
---
icon: i-lucide-sliders-horizontal
spotlight: true
to: /vue-guide/controller
---
#title
Controller

#description
Connect or disconnect the client at runtime.
::::

::::u-page-card
---
icon: i-lucide-file-code
spotlight: true
to: /api-reference
---
#title
API Reference

#description
Composable signatures, types, and options.
::::

::::u-page-card
---
icon: i-lucide-puzzle
spotlight: true
to: /convex-patterns
---
#title
Convex Patterns

#description
Schema, functions, and realtime patterns.
::::

:::
::

::important
If you use Nuxt, keep the `#convex*` aliases and Nuxt auto-imports in app code. Use this track to understand the shared runtime behavior underneath them.
::
