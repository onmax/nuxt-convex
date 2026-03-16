---
title: Nuxt Module
description: Understand what nuxt-convex adds on top of the shared Vue package, including auto-imports, virtual modules, storage helpers, and renderless components.
---

`nuxt-convex` is the Nuxt-specific layer in this monorepo. The module mirrors the shared Vue package through `#convex`, `#convex/storage`, and `#convex/advanced`, wires the supported composables into Nuxt auto-imports, resolves the generated API alias, and can scaffold storage helpers.

::u-page-section
#title
Open the Nuxt-specific guides

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    to: /nuxt-module/file-storage
    spotlight: true
    ---
    #title
    Set up file storage

    #description
    Enable scaffolded storage helpers and understand where generated files live.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 lg:col-span-1
    to: /api-reference/module-configuration
    spotlight: true
    ---
    #title
    Review module options

    #description
    Inspect the public configuration surface exposed by the module.
    ::::

    ::::u-page-card
    ---
    class: col-span-2
    to: /vue
    spotlight: true
    ---
    #title
    Continue in the shared Vue track

    #description
    Move there when you want shared composable behavior or Convex backend guidance instead of wrapper-specific setup.
    ::::
  :::
::

## What the module adds

- Auto-imports for the shared composables.
- `#convex`, `#convex/api`, and `#convex/advanced` aliases.
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

## How the module resolves files

The module resolves `convex.dir` across Nuxt layers. It prefers a layer that already contains generated Convex files. If the resolved layer is not writable, storage scaffolding falls back to the project layer and keeps imports pointed at the authoritative generated directory.

That behavior matters in layered Nuxt apps, starter kits, and modules that ship Convex files inside a layer.

## What stays shared with Vue core

The module does not reimplement the data layer.

- `#convex` mirrors `@onmax/convex-vue`
- `#convex/storage` mirrors `@onmax/convex-vue/storage`
- `#convex/advanced` mirrors `@onmax/convex-vue/advanced`

::tip
Read the Vue track for the shared composables and backend patterns. Read this section for Nuxt-specific configuration, aliases, and integration behavior.
::

## Next steps

- Read [File Storage](/nuxt-module/file-storage) to enable scaffolded storage helpers.
- Read [Cloudflare R2](/nuxt-module/cloudflare-r2) if you want bucket uploads.
- Read [API Reference](/api-reference) for the exact public surface.
