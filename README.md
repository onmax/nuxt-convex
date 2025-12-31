<p align="center">
  <img src="https://raw.githubusercontent.com/onmax/nuxt-convex/main/.github/og.webp" alt="Nuxt Convex" width="100%">
</p>

<h1 align="center">nuxt-convex</h1>

<p align="center">Nuxt module for <a href="https://convex.dev">Convex</a> - reactive backend with real-time sync, file storage, and auto-imports.</p>

<p align="center">
  <a href="https://npmjs.com/package/nuxt-convex"><img src="https://img.shields.io/npm/v/nuxt-convex/latest.svg?style=flat&colorA=020420&colorB=00DC82" alt="npm version"></a>
  <a href="https://npm.chart.dev/nuxt-convex"><img src="https://img.shields.io/npm/dm/nuxt-convex.svg?style=flat&colorA=020420&colorB=00DC82" alt="npm downloads"></a>
  <a href="https://npmjs.com/package/nuxt-convex"><img src="https://img.shields.io/npm/l/nuxt-convex.svg?style=flat&colorA=020420&colorB=00DC82" alt="License"></a>
  <a href="https://nuxt.com"><img src="https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js" alt="Nuxt"></a>
</p>

> **[Live Demo](https://nuxt-convex-playground.workers.dev)** · [Convex Docs](https://docs.convex.dev)

## Features

- **Real-time by default** - Queries auto-update when data changes
- **Virtual modules** - Import from `#convex`, `#convex/api`, and `#convex/storage`
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

The module reads `CONVEX_URL` or `NUXT_PUBLIC_CONVEX_URL` environment variables automatically. Run `npx convex dev` to start the Convex development server.

## Creating Your Backend

Convex functions live in the `convex/` directory at your project root. See [Convex docs](https://docs.convex.dev/functions) for full reference.

### Schema

Define your database tables with [schemas](https://docs.convex.dev/database/schemas). Tables are created automatically when you push to Convex.

```ts [convex/schema.ts]
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    userId: v.optional(v.string()),
    isCompleted: v.boolean(),
    createdAt: v.number(),
  }).index('by_user', ['userId']),
})
```

The `v` object provides [validators](https://docs.convex.dev/database/schemas#validators) for all Convex types: `v.string()`, `v.number()`, `v.boolean()`, `v.id('tableName')`, `v.array()`, `v.object()`, `v.optional()`, `v.union()`, etc.

### Queries

[Queries](https://docs.convex.dev/functions/query-functions) read data from the database. They are reactive - the UI updates automatically when underlying data changes.

```ts [convex/tasks.ts]
import { v } from 'convex/values'
import { query } from './_generated/server'

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('tasks')
      .withIndex('by_user', q => q.eq('userId', userId))
      .order('desc')
      .collect()
  },
})

export const get = query({
  args: { id: v.id('tasks') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id)
  },
})
```

### Mutations

[Mutations](https://docs.convex.dev/functions/mutation-functions) write data to the database. They are transactional and run on the server.

```ts [convex/tasks.ts]
import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const add = mutation({
  args: { title: v.string(), userId: v.string() },
  handler: async (ctx, { title, userId }) => {
    return await ctx.db.insert('tasks', {
      title,
      userId,
      isCompleted: false,
      createdAt: Date.now(),
    })
  },
})

export const toggle = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, { id }) => {
    const task = await ctx.db.get(id)
    if (task) {
      await ctx.db.patch(id, { isCompleted: !task.isCompleted })
    }
  },
})

export const remove = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
```

### Actions

[Actions](https://docs.convex.dev/functions/actions) run arbitrary code including external API calls, but cannot directly access the database. Use them for third-party integrations.

```ts [convex/ai.ts]
import { v } from 'convex/values'
import { action } from './_generated/server'

export const summarize = action({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    const response = await fetch('https://api.openai.com/v1/...', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ prompt: text }),
    })
    return await response.json()
  },
})
```

Actions can call mutations/queries via `ctx.runMutation()` and `ctx.runQuery()`.

## Usage

Composables are auto-imported. They wrap [@convex-vue/core](https://github.com/niconiahi/convex-vue).

### useConvexQuery

Subscribe to a [query](https://docs.convex.dev/functions/query-functions). Returns reactive data that auto-updates when the database changes.

```vue [app/pages/tasks.vue]
<script setup lang="ts">
import { api } from '#convex/api'

const { data: tasks, isLoading, error } = useConvexQuery(api.tasks.list, { userId: 'user_123' })
</script>

<template>
  <div v-if="isLoading">
    Loading...
  </div>
  <div v-else-if="error">
    Error: {{ error.message }}
  </div>
  <ul v-else>
    <li v-for="task in tasks" :key="task._id">
      {{ task.title }}
    </li>
  </ul>
</template>
```

**Return values:**

| Property    | Type                  | Description             |
| ----------- | --------------------- | ----------------------- |
| `data`      | `Ref<T \| undefined>` | Query result, reactive  |
| `isLoading` | `Ref<boolean>`        | True while initial load |
| `error`     | `Ref<Error \| null>`  | Error if query failed   |

### useConvexMutation

Call a [mutation](https://docs.convex.dev/functions/mutation-functions) to write data.

```vue [app/components/AddTask.vue]
<script setup lang="ts">
import { api } from '#convex/api'

const { mutate: addTask, isLoading, error } = useConvexMutation(api.tasks.add)

const title = ref('')

async function handleSubmit() {
  await addTask({ title: title.value, userId: 'user_123' })
  title.value = ''
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="title" :disabled="isLoading" placeholder="New task...">
    <button :disabled="isLoading">
      Add
    </button>
    <p v-if="error">
      {{ error.message }}
    </p>
  </form>
</template>
```

**Return values:**

| Property    | Type                   | Description              |
| ----------- | ---------------------- | ------------------------ |
| `mutate`    | `(args) => Promise<T>` | Call the mutation        |
| `isLoading` | `Ref<boolean>`         | True while running       |
| `error`     | `Ref<Error \| null>`   | Error if mutation failed |

### useConvexAction

Call an [action](https://docs.convex.dev/functions/actions) for external API calls or long-running tasks.

```vue [app/components/Summarize.vue]
<script setup lang="ts">
import { api } from '#convex/api'

const { execute: summarize, isLoading, error } = useConvexAction(api.ai.summarize)

const result = ref('')

async function handleSummarize(text: string) {
  result.value = await summarize({ text })
}
</script>
```

**Return values:**

| Property    | Type                   | Description            |
| ----------- | ---------------------- | ---------------------- |
| `execute`   | `(args) => Promise<T>` | Call the action        |
| `isLoading` | `Ref<boolean>`         | True while running     |
| `error`     | `Ref<Error \| null>`   | Error if action failed |

### useConvex

Get the raw [ConvexClient](https://docs.convex.dev/api/classes/browser.ConvexClient) for advanced usage.

```vue [app/components/Advanced.vue]
<script setup lang="ts">
import { api } from '#convex/api'

const client = useConvex()

// Direct client access for advanced patterns
const result = await client.query(api.tasks.get, { id: 'abc123' })
</script>
```

## File Storage

Convex provides built-in [file storage](https://docs.convex.dev/file-storage). Enable it in your config to auto-scaffold the required functions.

### Setup

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
  convex: {
    storage: true,
  },
})
```

This creates `convex/_hub/storage.ts` with `generateUploadUrl`, `getUrl`, and `remove` functions. Customize as needed.

Add the `uploads` table to your schema:

```ts [convex/schema.ts]
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  uploads: defineTable({
    storageId: v.id('_storage'),
    name: v.string(),
    type: v.string(),
    url: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.number(),
  }).index('by_user', ['userId']),
})
```

### useConvexStorage

Low-level composable for storage operations. Auto-imported when storage is enabled.

```vue [app/components/Storage.vue]
<script setup lang="ts">
import { api } from '#convex/api'

const { generateUploadUrl, getUrl, remove } = useConvexStorage(api)

// Get a reactive URL for a stored file
const fileUrl = getUrl('storage_id_here')

// Generate upload URL for direct upload
const uploadUrl = await generateUploadUrl.mutate()

// Delete a file
await remove.mutate({ storageId: 'storage_id_here' })
</script>
```

**Return values:**

| Property            | Type                                         | Description           |
| ------------------- | -------------------------------------------- | --------------------- |
| `generateUploadUrl` | `{ mutate: () => Promise<string> }`          | Get URL for uploading |
| `getUrl`            | `(storageId: string) => Ref<string \| null>` | Reactive file URL     |
| `remove`            | `{ mutate: (args) => Promise<void> }`        | Delete a file         |

### useConvexUpload

High-level composable for file uploads with progress tracking. Auto-imported.

```vue [app/pages/upload.vue]
<script setup lang="ts">
import { api } from '#convex/api'

const { generateUploadUrl } = useConvexStorage(api)
const saveFile = useConvexMutation(api._hub.storage.saveFile)

const { upload, isUploading, progress, error } = useConvexUpload({
  generateUploadUrl,
  onSuccess: async (storageId, file) => {
    await saveFile.mutate({
      storageId,
      name: file.name,
      type: file.type,
      userId: 'user_123',
    })
  },
  onError: err => console.error('Upload failed:', err),
})

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const storageId = await upload(file)
    console.log('Uploaded:', storageId)
  }
}
</script>

<template>
  <div>
    <input type="file" :disabled="isUploading" @change="handleFileChange">
    <p v-if="isUploading">
      Uploading... {{ progress }}%
    </p>
    <p v-if="error">
      {{ error.message }}
    </p>
  </div>
</template>
```

**Options:**

| Option              | Type                                      | Description                       |
| ------------------- | ----------------------------------------- | --------------------------------- |
| `generateUploadUrl` | `{ mutate: () => Promise<string> }`       | Required. From `useConvexStorage` |
| `onSuccess`         | `(storageId: string, file: File) => void` | Called after successful upload    |
| `onError`           | `(error: Error) => void`                  | Called on upload error            |

**Return values:**

| Property      | Type                                      | Description                      |
| ------------- | ----------------------------------------- | -------------------------------- |
| `upload`      | `(file: File) => Promise<string \| null>` | Upload a file, returns storageId |
| `isUploading` | `Ref<boolean>`                            | True while uploading             |
| `progress`    | `Ref<number>`                             | Upload progress 0-100            |
| `error`       | `Ref<Error \| null>`                      | Error if upload failed           |

## Configuration

| Option    | Type      | Default                  | Description                     |
| --------- | --------- | ------------------------ | ------------------------------- |
| `url`     | `string`  | `process.env.CONVEX_URL` | Convex deployment URL           |
| `storage` | `boolean` | `false`                  | Enable file storage integration |

**Environment variables:**

| Variable                 | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `CONVEX_URL`             | Convex deployment URL (set by `npx convex dev`) |
| `NUXT_PUBLIC_CONVEX_URL` | Alternative, follows Nuxt convention            |

## DevTools

When running in development, the module adds a **Convex** tab to Nuxt DevTools with an embedded Convex dashboard. Access your data, run functions, and view logs directly from DevTools.

## Better Auth Integration

Use [nuxt-better-auth](https://nuxt-better-auth.onmax.me/) for authentication alongside Convex for your app data.

### 1. Install dependencies

```bash
pnpm add @onmax/nuxt-better-auth
```

### 2. Configure nuxt-better-auth

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex', '@onmax/nuxt-better-auth'],
  convex: { storage: true },
})
```

### 3. Create server auth config

```ts [server/auth.config.ts]
import { defineServerAuth } from '@onmax/nuxt-better-auth/config'

export default defineServerAuth(() => ({
  emailAndPassword: { enabled: true },
}))
```

See [nuxt-better-auth docs](https://nuxt-better-auth.onmax.me/) for database adapters, social providers, and plugins.

### Using Convex as Auth Database (Advanced)

To store auth data directly in Convex instead of a SQL database:

```bash
pnpm add @convex-dev/better-auth better-auth --save-exact
```

```ts [convex/convex.config.ts]
import betterAuth from '@convex-dev/better-auth/convex.config'
import { defineApp } from 'convex/server'

const app = defineApp()
app.use(betterAuth)
export default app
```

```ts [server/auth.config.ts]
import { components } from '#convex/api'
import { createClient } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/server/plugins'
import { defineServerAuth } from '@onmax/nuxt-better-auth/config'

const authComponent = createClient(components.betterAuth)

export default defineServerAuth(() => ({
  database: authComponent.adapter(),
  plugins: [convex()],
  emailAndPassword: { enabled: true },
}))
```

This stores users, sessions, and accounts in Convex. See [@convex-dev/better-auth](https://github.com/get-convex/convex-better-auth) for details.

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
