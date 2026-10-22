---
title: Vue
description: Use vue-convex directly in a Vue 3 app for shared Convex queries, mutations, pagination, auth state, storage, and advanced runtime control.
navigation: false
---

Use this track when your app is a standalone Vue 3 app or when you want to understand the shared runtime that also powers `nuxt-convex`.

## Set up in three steps

::steps{level="3"}

### Install the package

```bash [Terminal]
pnpm add vue-convex convex
```

### Register the plugin

```ts [src/main.ts]
import { convexVue } from 'vue-convex'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App)
  .use(convexVue, { url: import.meta.env.VITE_CONVEX_URL })
  .mount('#app')
```

### Query from a component

```vue [src/App.vue]
<script setup lang="ts">
import { useConvexQuery } from 'vue-convex'
import { api } from '../convex/_generated/api'

const { data: tasks } = useConvexQuery(api.tasks.list)
</script>
```

::

## What this track owns

- the base `convexVue` plugin
- shared composables for reads, writes, pagination, auth, and connection state
- the `advanced` entrypoint for delayed connection and raw clients
- the `storage` entrypoint for upload helpers

If you are building a Nuxt app, keep the Nuxt-side aliases in app code and use this track to understand the shared behavior underneath them.

## Start with the Vue path

Open the page that matches your current task.

::card-group
:::card
---
icon: i-lucide-download
to: /vue-guide/installation
title: Install the plugin
---
Register `convexVue`, generate the API, and verify the first query.
:::

:::card
---
icon: i-lucide-search
to: /vue-guide/queries
title: Read data
---
Use reactive query arguments, SSR-aware reads, and skip logic.
:::

:::card
---
icon: i-lucide-pen-line
to: /vue-guide/mutations-and-actions
title: Write data
---
Call mutations and actions, including optimistic updates for mutations.
:::

:::card
---
icon: i-lucide-sliders-horizontal
to: /vue-guide/controller
title: Control the runtime
---
Connect later, reconfigure at runtime, or access the raw clients.
:::
::

## Related sections

- Read [Convex Patterns](/convex-patterns) for the backend model both tracks assume
- Read [API Reference](/api-reference) for exact signatures and return types
- Read [Nuxt](/nuxt) if you are working in a Nuxt app and need the wrapper contract
