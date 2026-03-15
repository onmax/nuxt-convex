---
title: Vue Core
description: Use @onmax/convex-vue directly in Vue 3 when you do not need the Nuxt module layer.
---

`@onmax/convex-vue` is the shared package behind the Nuxt module. Use it directly when you are building a standalone Vue app, a custom runtime, or a setup where you want full control over plugin installation.

::u-page-section
#title
Open the shared guides

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /vue-core/installation
    ---
    #title
    Install the plugin

    #description
    Add the package, register the plugin, and start using the shared composables in Vue 3.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    spotlight: true
    to: /api-reference
    ---
    #title
    Browse the shared API

    #description
    Review the root data-layer API plus the `/advanced` and `/storage` feature entrypoints.
    ::::

    ::::u-page-card
    ---
    class: col-span-2
    spotlight: true
    to: /convex-patterns
    ---
    #title
    Follow Convex backend patterns

    #description
    Learn the schema, function, and realtime conventions that the shared package expects.
    ::::
  :::
::

## What it exposes

- Root `@onmax/convex-vue`: `convexVue`, `useConvexQuery`, `useConvexMutation`, `useConvexAction`, `useConvexPaginatedQuery`
- `@onmax/convex-vue/advanced`: the controller hook and factory for delayed connection and raw client access
- `@onmax/convex-vue/storage`: the optional storage plugin plus `useConvexStorage` and `useConvexUpload`

## What it expects from you

The Vue package does not create aliases or auto-imports. You install the plugin, pass a Convex deployment URL, and import the composables from `@onmax/convex-vue`.

```ts [src/main.ts]
import { convexVue } from '@onmax/convex-vue'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(convexVue, {
  url: import.meta.env.VITE_CONVEX_URL,
})

app.mount('#app')
```

## Shared behavior with Nuxt

The composables behave the same once the plugin context exists. The main difference is how the context is created:

- Nuxt uses the module and runtime plugin.
- Vue uses `app.use(convexVue, options)`.

::important
This section is also the reference track for the shared API. If you use Nuxt and want to understand the lower layer, continue from here into the API reference and Convex patterns sections.
::

## Next steps

- Follow the [Vue installation guide](/vue-core/installation).
- Read [Manual Initialization](/vue-core/manual-initialization) if you need to connect later through `/advanced`.
- Read [API Reference](/api-reference) for composable details.
