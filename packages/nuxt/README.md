<p align="center">
  <img src="https://nuxt-convex.onmax.me/og/readme-banner.png" alt="Nuxt Convex: Convex for Nuxt and Vue" width="100%">
</p>

# nuxt-convex

Nuxt module for [Convex](https://convex.dev). It registers [`vue-convex`](https://npmx.dev/package/vue-convex), auto-imports its composables, and points `#convex/api` at your generated Convex API. Queries run once on the server during SSR and then stay subscribed in the browser.

## Install

```bash
pnpm add nuxt-convex convex
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
})
```

Run `npx convex dev`. It generates `convex/_generated/` and writes the deployment URL to `.env.local`, which the module reads in dev. In production, set `CONVEX_URL` at build time or `NUXT_PUBLIC_CONVEX_URL` at runtime.

## Use

```vue
<script setup lang="ts">
import { api } from '#convex/api'

const { data: tasks } = await useConvexQuery(api.tasks.list)

const { mutate: addTask } = useConvexMutation(api.tasks.add)
</script>

<template>
  <button @click="addTask({ text: 'New task' })">
    Add
  </button>
  <ul>
    <li v-for="task in tasks" :key="task._id">
      {{ task.text }}
    </li>
  </ul>
</template>
```

## Docs

[nuxt-convex.onmax.me/nuxt](https://nuxt-convex.onmax.me/nuxt) covers configuration, file storage, Cloudflare R2, and Better Auth.

## License

MIT
