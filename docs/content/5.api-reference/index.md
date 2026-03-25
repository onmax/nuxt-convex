---
title: API Reference
description: Review the current public API surface for nuxt-convex and @onmax/convex-vue.
---

This reference follows the shipped code in `packages/nuxt` and `packages/vue`. It covers the shared root composables, the explicit storage and advanced entrypoints, and the Nuxt-only exports that the wrapper adds on top.

::u-page-section
#title
Start with the shared API

:::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
::::u-page-card
---
icon: i-lucide-search
spotlight: true
to: /api-reference/use-convex-query
---
#title
Query Convex data

#description
Shared query behavior used by both tracks.
::::

::::u-page-card
---
icon: i-lucide-pen-line
spotlight: true
to: /api-reference/use-convex-mutation
---
#title
Call mutations and actions

#description
Shared write APIs for both runtimes.
::::

::::u-page-card
---
icon: i-simple-icons-nuxtdotjs
spotlight: true
to: /api-reference/module-configuration
---
#title
Review Nuxt-only exports

#description
Module config, virtual modules, and components.
::::

:::
::

## Browse the shared Vue API

- [`useConvexQuery`](/api-reference/use-convex-query)
- [`useConvexMutation`](/api-reference/use-convex-mutation)
- [`useConvexAction`](/api-reference/use-convex-action)
- [`useConvexPaginatedQuery`](/api-reference/use-convex-paginated-query)

## Browse the Vue feature entrypoints

- [`useConvexClient`](/api-reference/use-convex-client)
- [`useConvexHttpClient`](/api-reference/use-convex-http-client)
- [`useConvexController`](/api-reference/use-convex-controller)
- [`useConvexStorage`](/api-reference/use-convex-storage)
- [`useConvexUpload`](/api-reference/use-convex-upload)

## Browse the Nuxt-only API

- [`Module Configuration`](/api-reference/module-configuration)
- [`Virtual Modules`](/api-reference/virtual-modules)
- [`useConvexR2Upload`](/api-reference/use-convex-r2-upload)
- [`ConvexQuery`](/api-reference/convex-query)
- [`ConvexPaginatedQuery`](/api-reference/convex-paginated-query)

::note
This section belongs to the shared API reference because it documents both the shared runtime and the smaller Nuxt-only surface layered on top of it.
::
