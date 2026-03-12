---
title: Nuxt Module
description: Understand what nuxt-convex adds on top of the shared Vue package, including auto-imports, virtual modules, storage helpers, and renderless components.
---

`nuxt-convex` is the Nuxt-specific layer in this monorepo. It re-exports the shared Vue composables through `#convex`, wires them into Nuxt auto-imports, resolves the generated API alias, and optionally scaffolds storage helpers.

## What the module adds

- Auto-imports for the shared composables.
- `#convex` and `#convex/api` aliases.
- Optional `#convex/storage` and `#convex/r2` aliases.
- Global `ConvexQuery` and `ConvexPaginatedQuery` components.
- Dev-only warnings when the generated Convex API is missing.
- Optional storage scaffolding in `convex/_hub/storage.ts`.

## Minimal setup

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['nuxt-convex'],
  convex: {
    server: true,
    storage: false,
    r2: false,
  },
})
```

## How the layer resolves files

The module resolves `convex.dir` across Nuxt layers. It prefers a layer that already contains generated Convex files. If the resolved layer is not writable, storage scaffolding falls back to the project layer and keeps imports pointed at the authoritative generated directory.

That behavior matters in layered Nuxt apps, starter kits, and modules that ship Convex files inside a layer.

## What stays shared with Vue core

The module does not reimplement the data layer. `useConvexQuery`, `useConvexMutation`, `useConvexAction`, `useConvexClient`, `useConvexPaginatedQuery`, `useConvexStorage`, and `useConvexUpload` still come from `@onmax/convex-vue`.

## Next steps

- Read [File Storage](/nuxt-module/file-storage) to enable scaffolded storage helpers.
- Read [Cloudflare R2](/nuxt-module/cloudflare-r2) if you want bucket uploads.
- Read [API Reference](/api-reference) for the exact public surface.
