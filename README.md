# nuxt-convex

Nuxt module for [Convex](https://convex.dev) - reactive backend with real-time sync, file storage, and auto-imports.

> **[Live Demo](https://nuxt-convex-playground.workers.dev)** · [Convex Docs](https://docs.convex.dev)

## Features

- **Virtual modules** - Import from `#convex` and `#convex/storage`
- **Auto-imports** - Composables available without manual imports
- **File storage** - Upload API with auto-scaffolded Convex functions
- **DevTools** - Convex dashboard tab in Nuxt DevTools

## Requirements

- Nuxt 3.0.0 or higher
- A Convex project (run `npx convex dev` to create one)

## Setup

Install the module and its peer dependencies:

```bash
pnpm add nuxt-convex convex @convex-vue/core
```

Add the module to your Nuxt configuration:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
  convex: {
    storage: true, // Enable file storage (optional)
  },
})
```

The module reads the `CONVEX_URL` environment variable automatically. Run `npx convex dev` to start the Convex development server and set this variable.

## Usage

### Queries and Mutations

Use the Convex Vue composables to interact with your backend. The module re-exports these from `#convex`:

```vue [app/pages/tasks.vue]
<script setup>
import { useConvexQuery, useConvexMutation } from '#convex'
import { api } from '~/convex/_generated/api'

const tasks = useConvexQuery(api.tasks.list, {})
const addTask = useConvexMutation(api.tasks.add)

async function createTask(title: string) {
  await addTask.mutate({ title })
}
</script>

<template>
  <ul>
    <li v-for="task in tasks" :key="task._id">{{ task.title }}</li>
  </ul>
</template>
```

### File Upload

The module provides a `useConvexUpload` composable for uploading files to Convex storage. Enable storage in your config to auto-scaffold the required Convex functions:

```vue [app/pages/upload.vue]
<script setup>
import { useConvexUpload } from '#imports'
import { useConvexMutation } from '#convex'
import { api } from '~/convex/_generated/api'

const generateUploadUrl = useConvexMutation(api._hub.storage.generateUploadUrl)
const { upload, isUploading, error } = useConvexUpload({ generateUploadUrl })

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const storageId = await upload(file)
    console.log('Uploaded file:', storageId)
  }
}
</script>

<template>
  <input type="file" @change="handleFileChange" :disabled="isUploading">
  <p v-if="error">{{ error.message }}</p>
</template>
```

When storage is enabled, the module creates `convex/_hub/storage.ts` with the necessary mutations and queries. You can customize this file as needed.

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | `process.env.CONVEX_URL` | Convex deployment URL |
| `storage` | `boolean` | `false` | Enable file storage integration |

## Better Auth Integration

Use [nuxt-better-auth](https://nuxt-better-auth.onmax.me/) with Convex as your auth database.

### 1. Install dependencies

```bash
pnpm add @onmax/nuxt-better-auth @convex-dev/better-auth better-auth@1.3.8 --save-exact
```

### 2. Register the Convex component

```ts [convex/convex.config.ts]
import { defineApp } from 'convex/server'
import betterAuth from '@convex-dev/better-auth/convex.config'

const app = defineApp()
app.use(betterAuth)
export default app
```

### 3. Configure nuxt-better-auth

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex', '@onmax/nuxt-better-auth'],
  convex: { storage: true },
  betterAuth: {
    // Uses Convex adapter from @convex-dev/better-auth
  },
})
```

### 4. Create auth instance

```ts [server/utils/auth.ts]
import { betterAuth } from 'better-auth'
import { convex } from '@convex-dev/better-auth/server/plugins'
import { createClient } from '@convex-dev/better-auth'
import { components } from '~/convex/_generated/api'

const authComponent = createClient(components.betterAuth)

export const auth = betterAuth({
  database: authComponent.adapter(),
  plugins: [convex()],
  emailAndPassword: { enabled: true },
})
```

Convex stores users, sessions, and accounts. nuxt-better-auth handles routes and composables.

## Development

```bash
pnpm install
pnpm dev:prepare
pnpm dev
```

Run tests:

```bash
pnpm test
```

## License

MIT
