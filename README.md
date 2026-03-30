# Nuxt Convex

Realtime Convex helpers for Vue 3 and Nuxt.

This repo ships two packages that share the same core runtime:

- `nuxt-convex` for Nuxt apps that want module setup, auto-imports, `#convex/*` aliases, storage scaffolding, and Nuxt-side integrations
- `vue-convex` for standalone Vue 3 apps that want direct plugin setup and full control over runtime wiring

## Start here

- Read the docs site: [nuxt-convex.onmax.me](https://nuxt-convex.onmax.me/)
- Start with [Getting started](https://nuxt-convex.onmax.me/getting-started) if you are choosing between the Nuxt and Vue tracks
- Open the [Nuxt track](https://nuxt-convex.onmax.me/nuxt) if you are building a Nuxt app
- Open the [Vue track](https://nuxt-convex.onmax.me/vue) if you are building a standalone Vue 3 app

## Choose the right package

### `nuxt-convex`

Use this package when your app runs on Nuxt and you want the framework layer handled for you.

It adds:

- module registration through `modules: ['nuxt-convex']`
- auto-imports for the shared composables
- `#convex`, `#convex/api`, `#convex/advanced`, and optional `#convex/storage`
- Nuxt-side file storage scaffolding
- Nuxt-side Better Auth and Cloudflare R2 integration points

### `vue-convex`

Use this package when you want to install the Vue plugin directly in a Vue 3 app.

It gives you:

- the base `convexVue` plugin
- shared query, mutation, action, pagination, auth, and connection-state composables
- optional `advanced` and `storage` entrypoints
- explicit runtime control through the controller APIs

## Workspace layout

- [`packages/nuxt`](/Users/maxi/nuxt/convex/packages/nuxt) publishes `nuxt-convex`
- [`packages/vue`](/Users/maxi/nuxt/convex/packages/vue) publishes `vue-convex`
- [`docs`](/Users/maxi/nuxt/convex/docs) contains the public documentation site
- [`playground`](/Users/maxi/nuxt/convex/playground) is the Nuxt reference app used to exercise the module
- [`examples/vue`](/Users/maxi/nuxt/convex/examples/vue) is the standalone Vue example

## Development

```bash
pnpm install
pnpm docs:dev
```

Useful workspace commands:

- `pnpm dev` runs the Nuxt playground through the module package
- `pnpm dev:vue` runs the standalone Vue example
- `pnpm test` runs the package test suites
- `pnpm docs:build` builds the docs site

## License

MIT
