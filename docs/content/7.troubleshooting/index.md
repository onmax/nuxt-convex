---
title: Troubleshooting
description: Diagnose common setup and runtime issues in nuxt-convex and @onmax/convex-vue.
---

Use this page when the docs path is correct but the runtime still is not behaving the way you expect.

## `#convex/api` cannot be resolved

**Likely cause**

You have not run `npx convex dev`, or the generated files are outside the resolved `convex.dir`.

**How to verify**

Check whether `convex/_generated/api` exists in the project or layer that owns the Convex directory.

**Fix**

```bash [Terminal]
npx convex dev
```

Run this in the project that owns your `convex/` directory.

**Confirm**

The alias resolves and your app stops warning about missing generated files.

## The Convex URL is missing

**Likely cause**

Neither `convex.url`, `CONVEX_URL`, nor `NUXT_PUBLIC_CONVEX_URL` is set.

**How to verify**

Check your Nuxt config and environment variables.

**Fix**

```bash [.env]
CONVEX_URL=https://your-project.convex.cloud
```

**Confirm**

The runtime connects instead of starting disconnected.

## An authenticated SSR query returns `undefined`

**Likely cause**

The server-side query runs without the browser auth context.

**How to verify**

If the same query works after hydration or with `{ server: false }`, you are hitting an auth-sensitive SSR path.

**Fix**

```ts
const { data } = useConvexQuery(api.tasks.myTasks, {}, { server: false })
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

**Confirm**

The query loads correctly on the client.

## `useConvexStorage` or `useConvexUpload` is not available

**Likely cause**

The module storage feature is not enabled, or the Vue storage plugin is not installed.

**How to verify**

Check whether:

- Nuxt has `convex.storage: true`, or
- Vue has `convexVueStorage` installed

**Fix**

For Nuxt:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
  convex: {
    storage: true,
  },
})
```

For Vue, register `convexVueStorage` with `generateUploadUrl`, `getUrl`, and `remove`.

**Confirm**

The storage helpers resolve and uploads work from the client.

## `useConvexR2Upload` is not available

**Likely cause**

The R2 module feature is not enabled.

**How to verify**

Check whether `convex.r2` is set to `true` in `nuxt.config.ts`.

**Fix**

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
  convex: {
    r2: true,
  },
})
```

Also install `@convex-dev/r2` and register the Convex component.

**Confirm**

`useConvexR2Upload` is auto-imported and the upload flow starts successfully.

## Queries throw before the runtime connects

**Likely cause**

You installed the shared runtime without a URL and then called queries, mutations, or actions before `connect()`.

**How to verify**

Check whether `controller.status.value` is still `disconnected`.

**Fix**

Call `controller.connect({ url })` first, or guard the query with `"skip"` until the runtime is ready.

**Confirm**

The controller reports `connected` and the composables stop throwing.

## Paginated queries do not render on the server

**Likely cause**

`useConvexPaginatedQuery` is client-only by design.

**How to verify**

The page renders after hydration but not during SSR.

**Fix**

Use `useConvexQuery` for the initial SSR-friendly data and keep `useConvexPaginatedQuery` for the interactive client-side feed.

**Confirm**

The initial content renders through the non-paginated query, and the client-side feed continues from there.
