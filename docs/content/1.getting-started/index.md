---
title: Getting Started
description: Choose the Nuxt or Vue track, confirm the shared Convex prerequisites, and route yourself to the right installation guide.
---

Use this section when you are setting up the repo for the first time. The goal is to get you to the correct package, confirm the shared Convex requirements, and then send you to the shortest working path.

## Choose your app runtime

Pick one track and stay on it for setup:

- [Nuxt track](/nuxt) if your app runs on Nuxt and you want `nuxt-convex`
- [Vue track](/vue) if your app runs on standalone Vue 3 and you want `@onmax/convex-vue`

## Shared prerequisites

Both tracks assume the same Convex backend basics.

::steps

### Create or connect a Convex project

Run `npx convex dev` in the app that owns your `convex/` directory.

### Keep the generated API in sync

The docs use generated imports such as `convex/_generated/api`, `convex/_generated/server`, and `#convex/api`. Those imports only exist after Convex has generated types for your project.

### Decide where the deployment URL comes from

The Nuxt module can read `convex.url`, `CONVEX_URL`, or `NUXT_PUBLIC_CONVEX_URL`. The standalone Vue plugin receives the URL through its install options.

::

## What both tracks share

Both packages expose the same shared data-layer concepts:

- `useConvexQuery`
- `useConvexQueries`
- `useConvexMutation`
- `useConvexAction`
- `useConvexPaginatedQuery`
- `useConvexAuth`
- `useConvexConnectionState`

The advanced Vue entrypoint adds:

- `useConvexController`
- `createConvexVueController`
- `useConvexClient`
- `useConvexHttpClient`

The storage entrypoint adds:

- `useConvexStorage`
- `useConvexUpload`

## Open the right installation guide

- Read [Installation](/getting-started/installation) if you still need to choose between Nuxt and Vue at install time
- Read [Nuxt](/nuxt) if you already know you want the Nuxt module
- Read [Vue](/vue) if you already know you want the standalone Vue package
