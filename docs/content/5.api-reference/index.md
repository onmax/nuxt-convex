---
title: API Reference
description: Review the current public API surface for nuxt-convex and @onmax/convex-vue.
---

This reference follows the shipped code in `packages/nuxt` and `packages/vue`. It covers the shared root composables, the explicit storage and advanced entrypoints, and the Nuxt-only exports that build on top of them.

::u-page-section
#title
Start with the shared API

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 md:col-span-1
    spotlight: true
    to: /api-reference/use-convex-query
    ---
    #title
    Query Convex data

    #description
    Start with `useConvexQuery` and the shared query behavior used by both runtime tracks.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 md:col-span-1
    spotlight: true
    to: /api-reference/use-convex-mutation
    ---
    #title
    Call mutations and actions

    #description
    Review the shared write APIs before you move into runtime-specific wiring.
    ::::

    ::::u-page-card
    ---
    class: col-span-2
    spotlight: true
    to: /api-reference/module-configuration
    ---
    #title
    Review Nuxt-only exports

    #description
    Inspect module configuration, virtual modules, `useConvexR2Upload`, and the renderless components that only the Nuxt wrapper adds.
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
This section belongs to the shared Vue track because it documents the lower-level API surface that the Nuxt module wraps.
::
