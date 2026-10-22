---
title: Getting Started
description: Choose the Nuxt or Vue track, install the package, and set up local development with Convex.
---

`nuxt-convex` is a Nuxt module for [Convex](https://convex.dev). It's built on `vue-convex`, a Vue 3 plugin with the same composables, which you can also use on its own.

## Choose your track

- [Nuxt](/nuxt) if your app runs on Nuxt. You get SSR with payload hydration, the signed-in user on the server, auto-imports and server helpers.
- [Vue](/vue) if your app is a standalone Vue 3 app, usually a Vite SPA.

## Set up

::steps

### Install

Follow [Installation](/getting-started/installation) for your track.

### Run Convex next to your app

`npx convex dev` creates a deployment, generates `convex/_generated/` and pushes your functions on save. See [Local Development](/getting-started/local-development), including how to work without a Convex account.

### Write your first functions

Read [Convex Patterns](/convex-patterns) for the schema and function shapes the docs assume.

::

## What both packages share

The same composables, from `vue-convex` or auto-imported in Nuxt:

- `useConvexQuery` and `useConvexQueries`
- `useConvexMutation` and `useConvexAction`
- `useConvexPaginatedQuery`
- `useConvexAuth` and the `ConvexAuthenticated`, `ConvexUnauthenticated` and `ConvexAuthLoading` components
- `useConvexConnectionState`
- `isConvexError`

The advanced entrypoint (`vue-convex/advanced`, `#convex/advanced` in Nuxt) adds `useConvexController`, `createConvexVueController`, `useConvexClient` and `useConvexHttpClient`. The storage entrypoint (`vue-convex/storage`, `#convex/storage`) adds `useConvexStorage` and `useConvexUpload`.

## Not sure yet?

[Why nuxt-convex](/getting-started/why-nuxt-convex) compares it with using `convex/browser` directly and with other community packages.
