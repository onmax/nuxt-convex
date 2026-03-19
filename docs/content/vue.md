---
title: Vue
description: Use @onmax/convex-vue directly in any Vue 3 app for realtime data, mutations, pagination, and file storage.
navigation: false
---

Use this track when you install `@onmax/convex-vue` directly in a Vue 3 app. It covers plugin setup, data fetching, mutations, pagination, file storage, and the advanced controller.

This track also serves as the reference for the shared runtime that the Nuxt module wraps. Nuxt users can read it to understand lower-level composable behavior without changing their Nuxt import paths.

::u-page-section
#title
Start with the Vue package

#description
Follow the guides in order, or jump to the topic you need.

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue-guide/installation
    ---
    #title
    Installation

    #description
    Install `@onmax/convex-vue`, register the plugin, and verify with a first query.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue-guide/queries
    ---
    #title
    Queries

    #description
    Subscribe to Convex queries with reactive arguments, SSR support, and realtime updates.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue-guide/mutations-and-actions
    ---
    #title
    Mutations & Actions

    #description
    Write data with mutations, run server-side logic with actions, and track pending state.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue-guide/pagination
    ---
    #title
    Pagination

    #description
    Load data page by page with cursor-based pagination and infinite scroll.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue-guide/file-storage
    ---
    #title
    File Storage

    #description
    Upload files and display them with reactive URL subscriptions.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue-guide/controller
    ---
    #title
    Controller

    #description
    Connect, reconfigure, or disconnect the Convex client at runtime.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /api-reference
    ---
    #title
    API Reference

    #description
    Browse composable signatures, return types, and options for every shared export.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /convex-patterns
    ---
    #title
    Convex Patterns

    #description
    Review schema, function, and realtime patterns that both runtimes share.
    ::::
  :::
::

::important
If you use Nuxt, keep the `#convex*` aliases and Nuxt auto-imports in app code. Use this track to understand the shared runtime behavior underneath them.
::
