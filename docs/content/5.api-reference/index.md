---
title: API Reference
description: Look up the public API surface for nuxt-convex and vue-convex.
---

Use this section for precise lookup: config keys, aliases, composables, components, server helpers and feature entrypoints. In Nuxt, the composables are auto-imported; in Vue, import them from the entrypoint named on each page.

## Composables

Exported from `vue-convex`, and from `#convex` in Nuxt.

- [`useConvexQuery`](/api-reference/use-convex-query)
- [`useConvexQueries`](/api-reference/use-convex-queries)
- [`useConvexMutation`](/api-reference/use-convex-mutation)
- [`useConvexAction`](/api-reference/use-convex-action)
- [`useConvexPaginatedQuery`](/api-reference/use-convex-paginated-query)
- [`useConvexAuth`](/api-reference/use-convex-auth), with `ConvexAuthenticated`, `ConvexUnauthenticated` and `ConvexAuthLoading`
- [`useConvexConnectionState`](/api-reference/use-convex-connection-state)
- [`isConvexError`](/api-reference/is-convex-error)
- [`convexVue`](/api-reference/convex-vue), the Vue plugin

## Advanced entrypoint

Exported from `vue-convex/advanced`, and from `#convex/advanced` in Nuxt.

- [`useConvexController`](/api-reference/use-convex-controller)
- [`useConvexClient`](/api-reference/use-convex-client)
- [`useConvexHttpClient`](/api-reference/use-convex-http-client)

## Storage entrypoint

Exported from `vue-convex/storage`, and from `#convex/storage` in Nuxt with `storage: true`.

- [`useConvexStorage`](/api-reference/use-convex-storage)
- [`useConvexUpload`](/api-reference/use-convex-upload)

## Nuxt only

- [Module configuration](/api-reference/module-configuration)
- [Virtual modules](/api-reference/virtual-modules)
- [Server helpers](/nuxt-module/server-routes): `useConvexServer`, `serverConvexQuery`, `serverConvexMutation`, `serverConvexAction`, `getConvexToken`, `requireConvexAuth`, `toConvexH3Error`, and the `convex:token` hook
- [`ConvexQuery`](/api-reference/convex-query)
- [`ConvexPaginatedQuery`](/api-reference/convex-paginated-query)
- [`useConvexR2Upload`](/api-reference/use-convex-r2-upload)

## How to use this section

- Read the [Nuxt Module](/nuxt-module) guides or the [Vue Guide](/vue-guide) for walkthroughs
- Use this section when you need exact signatures, defaults, or behavior notes
