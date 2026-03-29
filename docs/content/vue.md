---
title: Vue
description: Use @onmax/convex-vue directly in a Vue 3 app for shared Convex queries, mutations, pagination, auth state, storage, and advanced runtime control.
navigation: false
---

Use this track when your app is a standalone Vue 3 app or when you want to understand the shared runtime that also powers `nuxt-convex`.

This track owns:

- the base `convexVue` plugin
- shared composables for reads, writes, pagination, auth, and connection state
- the `advanced` entrypoint for delayed connection and raw clients
- the `storage` entrypoint for upload helpers

If you are building a Nuxt app, keep the Nuxt-side aliases in app code and use this track to understand the shared behavior underneath them.

::u-page-section{orientation="vertical"}
#title
Start with the Vue path

#description
Open the page that matches your current task.

:::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
::::u-page-card
---
icon: i-lucide-download
spotlight: true
to: /vue-guide/installation
---
#title
Install the plugin

#description
Register `convexVue`, generate the API, and verify the first query.
::::

::::u-page-card
---
icon: i-lucide-search
spotlight: true
to: /vue-guide/queries
---
#title
Read data

#description
Use reactive query arguments, SSR-aware reads, and skip logic.
::::

::::u-page-card
---
icon: i-lucide-pen-line
spotlight: true
to: /vue-guide/mutations-and-actions
---
#title
Write data

#description
Call mutations and actions, including optimistic updates for mutations.
::::

::::u-page-card
---
icon: i-lucide-sliders-horizontal
spotlight: true
to: /vue-guide/controller
---
#title
Control the runtime

#description
Connect later, reconfigure at runtime, or access the raw clients.
::::

:::
::

## Related sections

- Read [Convex Patterns](/convex-patterns) for the backend model both tracks assume
- Read [API Reference](/api-reference) for exact signatures and return types
- Read [Nuxt](/nuxt) if you are working in a Nuxt app and need the wrapper contract
