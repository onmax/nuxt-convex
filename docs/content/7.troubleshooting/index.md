---
title: Troubleshooting
description: Common issues and solutions when working with nuxt-convex and @onmax/convex-vue.
---

## `#convex/api` not found

The Nuxt module warns when it cannot resolve the generated Convex API.

**Cause:** `npx convex dev` has not been run, or the generated files are outside the resolved `convex.dir`.

**Fix:**

```bash [Terminal]
npx convex dev
```

Run this in the project that owns your Convex directory. The command creates `convex/_generated/api` and `convex/_generated/server`.

## Missing `CONVEX_URL`

The module reads the deployment URL in this order:

1. `convex.url` in `nuxt.config.ts`
2. `CONVEX_URL` environment variable
3. `NUXT_PUBLIC_CONVEX_URL` environment variable

If none are set, the plugin starts disconnected. Add the URL to your `.env`:

```bash [.env]
CONVEX_URL=https://your-project.convex.cloud
```

## SSR queries return `undefined` for authenticated data

Server-side query execution does not automatically forward browser auth tokens. The `ConvexHttpClient` used during SSR has no session context.

**Fix:** Disable SSR for auth-dependent queries:

```ts
const { data } = useConvexQuery(api.tasks.myTasks, args, { server: false })
```

Or disable SSR globally:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
  convex: {
    server: false,
  },
})
```

## Storage composables not available

`useConvexStorage` and `useConvexUpload` require `storage: true` in the module config.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
  convex: {
    storage: true,
  },
})
```

The module scaffolds `convex/_hub/storage.ts` on first run if it does not exist.

## `useConvexR2Upload` not available

R2 upload support requires `r2: true` in the module config.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
  convex: {
    r2: true,
  },
})
```

Also install the Convex R2 component: `pnpm add @convex-dev/r2`. See the [R2 integration](/integrations/r2) page for the full setup.

## Queries throw before `connect()`

When using the [controller](/vue-guide/controller) for delayed connection, composables like `useConvexQuery` throw if called before `controller.connect()`.

**Fix:** Guard composable calls on connection status:

```ts
const controller = useConvexController()

// Wait for connection before querying
watch(() => controller.status.value, (status) => {
  if (status === 'connected') {
    // safe to use queries
  }
})
```

Or pass `"skip"` as args until the connection is established.

## Paginated queries not rendering on the server

`useConvexPaginatedQuery` is client-only. It does not support SSR prefetching. The first page loads after hydration through the realtime subscription.

This is by design — use `useConvexQuery` with server-side rendering when you need SEO for the initial data.
