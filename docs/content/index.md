---
title: Nuxt Convex
description: Convex for Nuxt and Vue. Await a query, render it on the server, and keep it live over the WebSocket, typed end to end from your Convex functions.
navigation: false
---

::landing-hero
---
title: Convex for Nuxt and Vue, server-rendered and live
highlight: server-rendered and live
description: Await a query to render it on the server, then keep it live over the WebSocket. Typed end to end from your Convex functions.
badge:
  label: Awaitable queries with SSR hydration
  to: /nuxt-module/ssr-and-hydration
links:
  - label: Get started
    to: /getting-started
    trailingIcon: i-lucide-arrow-right
  - label: GitHub
    to: https://github.com/onmax/nuxt-convex
    target: _blank
    icon: i-simple-icons-github
---

#backend
```ts [convex/tasks.ts]
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('tasks').order('desc').take(20)
  },
})

export const add = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    await ctx.db.insert('tasks', { text, isCompleted: false })
  },
})
```

#nuxt
```vue [app/pages/index.vue]
<script setup lang="ts">
import { api } from '#convex/api'

// Rendered on the server, hydrated from the payload, then live.
const { data: tasks } = await useConvexQuery(api.tasks.list)
const { mutate: addTask } = useConvexMutation(api.tasks.add)
</script>

<template>
  <button @click="addTask({ text: 'Ship it' })">
    Add task
  </button>
  <ul>
    <li v-for="task in tasks" :key="task._id">
      {{ task.text }}
    </li>
  </ul>
</template>
```

#vue
```vue [src/App.vue]
<script setup lang="ts">
import { useConvexMutation, useConvexQuery } from 'vue-convex'
import { api } from '../convex/_generated/api'

// Subscribes over the WebSocket and updates as data changes.
const { data: tasks } = useConvexQuery(api.tasks.list)
const { mutate: addTask } = useConvexMutation(api.tasks.add)
</script>

<template>
  <button @click="addTask({ text: 'Ship it' })">
    Add task
  </button>
  <ul>
    <li v-for="task in tasks" :key="task._id">
      {{ task.text }}
    </li>
  </ul>
</template>
```
::

::landing-features
---
eyebrow: Why nuxt-convex
title: The Convex client, shaped for Nuxt
description: One set of composables for reads, writes, auth and uploads. The Nuxt module adds SSR, aliases and auto-imports on top.
items:
  - icon: i-lucide-server
    title: SSR that hands off to realtime
    description: Awaited queries run once on the server, hydrate from the payload without refetching, then subscribe over the WebSocket.
  - icon: i-lucide-braces
    title: Types from your functions
    description: Arguments and results are inferred from your Convex functions through `#convex/api`. Rename a field and the page stops compiling.
  - icon: i-lucide-hourglass
    title: Awaitable composables
    description: "`await useConvexQuery()` blocks SSR until data is in and never rejects. Leave out `await` and it loads on the client."
  - icon: i-lucide-shield-check
    title: Authenticated SSR
    description: Better Auth runs inside Convex, or bring your own provider. Tokens resolve on the server; only `isAuthenticated` reaches the client.
  - icon: i-lucide-cloud-upload
    title: File storage and R2 uploads
    description: "`useConvexUpload` for Convex storage and `useConvexR2Upload` for Cloudflare R2, both reporting upload progress."
  - icon: i-simple-icons-vuedotjs
    title: Works in plain Vue too
    description: "`vue-convex` is the same runtime as a Vue 3 plugin: `app.use(convexVue, { url })` and the same composables."
---
::

::landing-tracks
---
eyebrow: Two packages
title: Pick the track that matches your app
description: Both packages share one runtime. Nuxt adds the framework wiring; Vue gives you the plugin and full control.
tracks:
  - id: nuxt
    package: nuxt-convex
    title: Nuxt module
    description: Register the module and the composables are auto-imported, with SSR and the request's session handled for you.
    points:
      - Auto-imports and `#convex/*` aliases
      - Server-rendered queries with payload hydration
      - Better Auth, file storage and Cloudflare R2
    snippet: "export default defineNuxtConfig({\n  modules: ['nuxt-convex'],\n})"
    to: /nuxt
    cta: Read the Nuxt track
  - id: vue
    package: vue-convex
    title: Vue plugin
    description: Install the plugin in any Vue 3 app and use the same composables, with explicit control over the connection.
    points:
      - Queries, mutations, actions and pagination
      - Connect later or swap deployments at runtime
      - Storage uploads through `vue-convex/storage`
    snippet: "app.use(convexVue, {\n  url: import.meta.env.VITE_CONVEX_URL,\n})"
    to: /vue
    cta: Read the Vue track
---
::

::landing-how-it-works
---
eyebrow: How it works
title: One query, three hops
description: The same call serves the first paint and every update after it.
steps:
  - icon: i-lucide-server-cog
    title: Render on the server
    description: "`await` runs the query once over `ConvexHttpClient`. Identical queries in one request share a fetch."
    label: ConvexHttpClient
  - icon: i-lucide-package
    title: Ship it in the payload
    description: The result is stored in the Nuxt payload, so hydration matches the server HTML without another request.
    label: Nuxt payload
  - icon: i-lucide-radio-tower
    title: Subscribe in the browser
    description: The client opens a WebSocket subscription and swaps in new values as Convex pushes them.
    label: ConvexClient · WebSocket
link:
  label: Read about SSR and hydration
  to: /nuxt-module/ssr-and-hydration
---
::

::landing-cta
---
title: Ship your first live query
description: Install the module, run npx convex dev, and await your first query.
links:
  - label: Get started
    to: /getting-started/installation
    trailingIcon: i-lucide-arrow-right
  - label: Browse the API reference
    to: /api-reference
---
::
