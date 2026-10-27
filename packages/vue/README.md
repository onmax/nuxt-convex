<p align="center">
  <img src="https://nuxt-convex.onmax.me/og/readme-banner.png" alt="Nuxt Convex: Convex for Nuxt and Vue" width="100%">
</p>

# vue-convex

[![npm version](https://comark-ui.onmax.me/badge.svg?source=npm-version&package=vue-convex&icon=npm)](https://www.npmjs.com/package/vue-convex)
[![npm downloads](https://comark-ui.onmax.me/badge.svg?source=npm-downloads&package=vue-convex&period=month&icon=npm)](https://www.npmjs.com/package/vue-convex)
[![license](https://comark-ui.onmax.me/badge.svg?label=license&value=MIT)](https://github.com/onmax/nuxt-convex/blob/main/LICENSE)
[![docs](https://comark-ui.onmax.me/badge.svg?label=docs&value=nuxt-convex.onmax.me)](https://nuxt-convex.onmax.me)

Vue 3 plugin and composables for [Convex](https://convex.dev): queries that update in realtime, mutations, actions, pagination, auth, and file storage. Using Nuxt? Install [`nuxt-convex`](https://npmx.dev/package/nuxt-convex) instead.

## Install

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

## Use

```vue
<script setup lang="ts">
import { useConvexMutation, useConvexQuery } from 'vue-convex'
import { api } from '../convex/_generated/api'

const { data: tasks } = useConvexQuery(api.tasks.list)
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

`tasks` updates whenever the data changes in Convex, in every open tab.

## Docs

[nuxt-convex.onmax.me/vue](https://nuxt-convex.onmax.me/vue) covers queries, pagination, auth, file storage, and the controller.

## License

MIT
