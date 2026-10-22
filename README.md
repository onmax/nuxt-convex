<p align="center">
  <img src="https://nuxt-convex.onmax.me/og/readme-banner.png" alt="Nuxt Convex: Convex for Nuxt and Vue" width="100%">
</p>

<h1 align="center">Nuxt Convex</h1>

<p align="center">Convex for Nuxt and Vue: realtime queries that render on the server and stay live in the browser.</p>

<p align="center">
  <a href="https://npmx.dev/package/nuxt-convex"><img src="https://npmx.dev/api/registry/badge/version/nuxt-convex" alt="nuxt-convex version"></a>
  <a href="https://npmx.dev/package/nuxt-convex"><img src="https://npmx.dev/api/registry/badge/downloads/nuxt-convex" alt="nuxt-convex downloads"></a>
  <a href="https://npmx.dev/package/vue-convex"><img src="https://npmx.dev/api/registry/badge/version/vue-convex" alt="vue-convex version"></a>
  <a href="https://npmx.dev/package/vue-convex"><img src="https://npmx.dev/api/registry/badge/downloads/vue-convex" alt="vue-convex downloads"></a>
  <a href="https://nuxt-convex.onmax.me"><img src="https://img.shields.io/badge/docs-nuxt--convex.onmax.me-e56a3b" alt="Docs"></a>
  <a href="https://npmx.dev/package/nuxt-convex"><img src="https://npmx.dev/api/registry/badge/license/nuxt-convex" alt="License"></a>
</p>

[Convex](https://convex.dev) is a backend where queries are reactive: when the data changes, every client subscribed to a query gets the new result. This repo connects it to Vue. `vue-convex` is a Vue plugin with composables for queries, mutations, actions, pagination, auth, and file storage. `nuxt-convex` is a Nuxt module built on it: it registers the plugin, auto-imports the composables, and points `#convex/api` at your generated Convex API. In Nuxt, a query runs once on the server during SSR and then subscribes over WebSocket in the browser, so the page arrives with data and keeps it current.

## Quick start (Nuxt)

Install the module and Convex:

```bash
pnpm add nuxt-convex convex
```

Add the module:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
})
```

Write a query and a mutation in `convex/`:

```ts
// convex/tasks.ts
import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: ctx => ctx.db.query('tasks').order('desc').collect(),
})

export const add = mutation({
  args: { text: v.string() },
  handler: (ctx, { text }) => ctx.db.insert('tasks', { text }),
})
```

Start Convex. It creates a deployment, pushes your functions, and generates `convex/_generated/` while it watches for changes:

```bash
npx convex dev
```

It writes the deployment URL to `.env.local`, which the module reads in dev. For production builds, set `CONVEX_URL` (or `NUXT_PUBLIC_CONVEX_URL` at runtime, or `convex.url` in `nuxt.config.ts`).

Use it in a page. `useConvexQuery` and `useConvexMutation` are auto-imported:

```vue
<!-- app/pages/index.vue -->
<script setup lang="ts">
import { api } from '#convex/api'

// fetched during SSR, then kept live over the WebSocket
const { data: tasks } = await useConvexQuery(api.tasks.list)

const { mutate: addTask, isPending } = useConvexMutation(api.tasks.add)
const text = ref('')

async function submit() {
  await addTask({ text: text.value })
  text.value = ''
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="text" placeholder="New task">
    <button :disabled="isPending">
      Add
    </button>
  </form>
  <ul>
    <li v-for="task in tasks" :key="task._id">
      {{ task.text }}
    </li>
  </ul>
</template>
```

Open the page in two tabs and add a task in one: the other updates without a reload.

## Vue without Nuxt

```bash
pnpm add vue-convex convex
```

```ts
// src/main.ts
import { createApp } from 'vue'
import { convexVue } from 'vue-convex'
import App from './App.vue'

createApp(App)
  .use(convexVue, { url: import.meta.env.VITE_CONVEX_URL })
  .mount('#app')
```

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { useConvexQuery } from 'vue-convex'
import { api } from '../convex/_generated/api'

const { data: tasks } = useConvexQuery(api.tasks.list)
</script>
```

## Features

Both packages:

- `useConvexQuery` returns typed `data`, `error` and `status` refs. Arguments can be refs or getters, and `'skip'` pauses the query. Awaiting it fetches during SSR, the result travels in the page payload, and the browser picks up from there over the WebSocket without fetching again.
- `useConvexQueries` subscribes to a record of queries at once.
- `useConvexMutation` returns `mutate` and `useConvexAction` returns `execute`, each with `error` and `isPending`. Mutations accept Convex optimistic updates.
- `useConvexPaginatedQuery` loads pages on the client, with `insertAtTop`, `insertAtPosition`, `insertAtBottomIfLoaded`, and `optimisticallyUpdateValueInPaginatedQuery` for optimistic updates.
- `useConvexAuth` passes a token fetcher to Convex and exposes `isLoading` and `isAuthenticated`. `<ConvexAuthenticated>`, `<ConvexUnauthenticated>`, and `<ConvexAuthLoading>` render by auth state.
- `useConvexConnectionState` exposes the WebSocket connection state and `isConnected`.
- File storage: `useConvexUpload` and `useConvexStorage` upload files and read their URLs through your Convex storage functions.
- Lower-level access: `useConvexClient`, `useConvexHttpClient`, and a controller to connect, reconfigure, or disconnect at runtime, for example after the URL is known.

`nuxt-convex` adds:

- Auto-imports for the composables, and the `#convex`, `#convex/api`, and `#convex/advanced` aliases. The `convex/` directory is found across Nuxt layers.
- `<ConvexQuery>` and `<ConvexPaginatedQuery>`, renderless components with slots for loading, error, empty, and data.
- `convex: { server: false }` to skip SSR fetches for every query, or `{ server: false }` on a single one.
- `convex: { storage: true }` scaffolds `convex/_hub/storage.ts` and auto-imports the storage composables from `#convex/storage`.
- `convex: { r2: true }` auto-imports `useConvexR2Upload` for [Cloudflare R2 through `@convex-dev/r2`](https://nuxt-convex.onmax.me/integrations/r2).
- A Convex database provider for [Better Auth](https://nuxt-convex.onmax.me/integrations/better-auth), with an HTTP adapter at `nuxt-convex/better-auth`.
- A Nuxt DevTools tab with your Convex dashboard.

## Docs

- [Getting started](https://nuxt-convex.onmax.me/getting-started): choose between the Nuxt and Vue packages
- [Nuxt](https://nuxt-convex.onmax.me/nuxt): module setup, configuration, storage, and integrations
- [Vue](https://nuxt-convex.onmax.me/vue): plugin setup, queries, mutations, pagination, auth, and the controller
- [API reference](https://nuxt-convex.onmax.me/api-reference)

## Develop

```bash
pnpm install
pnpm dev        # the Nuxt playground in playground/
pnpm dev:vue    # the Vue example in examples/vue/
pnpm test       # vue-convex and nuxt-convex test suites
pnpm docs:dev   # the docs site in docs/
pnpm docs:og    # redraw docs/public/og/*.png
```

`packages/vue` publishes `vue-convex` and `packages/nuxt` publishes `nuxt-convex`. Both share one version.

## Release

Releases are cut by [uppt](https://github.com/danielroe/uppt) from [conventional commits](https://www.conventionalcommits.org). Every push to `main` opens or updates a draft release PR with the next version and changelog. Merging it tags the release and publishes both packages to npm.

## License

[MIT](./LICENSE)
