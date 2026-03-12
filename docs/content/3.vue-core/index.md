---
title: Vue Core
description: Use @onmax/convex-vue directly in Vue 3 when you do not need the Nuxt module layer.
---

`@onmax/convex-vue` is the shared package behind the Nuxt module. Use it directly when you are building a standalone Vue app, a custom runtime, or a setup where you want to own the plugin installation yourself.

## What it exposes

- `convexVue`
- `useConvexContext`
- `useConvexClient`
- `useConvexQuery`
- `useConvexMutation`
- `useConvexAction`
- `useConvexPaginatedQuery`
- `useConvexStorage`
- `useConvexUpload`

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

## Next steps

- Follow the [Vue installation guide](/vue-core/installation).
- Read [Manual Initialization](/vue-core/manual-initialization) if you need to create the client later.
- Read [API Reference](/api-reference) for composable details.
