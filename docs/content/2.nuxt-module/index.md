---
title: Nuxt Module
description: Understand what nuxt-convex adds on top of the shared Vue package, including auto-imports, virtual modules, storage helpers, and renderless components.
---

`nuxt-convex` is the Nuxt-specific layer in this monorepo. It exposes the shared runtime to Nuxt app code through `#convex`, `#convex/advanced`, `#convex/api`, and optional `#convex/storage`. It also wires the supported composables into Nuxt auto-imports, registers the renderless components, and can scaffold storage helpers.

Use the Nuxt playground dashboard as the validation reference for this layer. The `Tasks`, `Convex Storage`, `Cloudflare R2`, and `Session & Diagnostics` sections are the concrete flows that these docs describe.

::u-page-section{align="left"}
#title
Open the Nuxt-specific guides

  :::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
    ::::u-page-card
    ---
    icon: i-lucide-hard-drive
    to: /nuxt-module/file-storage
    spotlight: true
    ---
    #title
    Set up file storage

    #description
    Scaffolded storage helpers and generated files.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-settings
    to: /api-reference/module-configuration
    spotlight: true
    ---
    #title
    Review module options

    #description
    Public configuration surface of the module.
    ::::

    ::::u-page-card
    ---
    icon: i-simple-icons-vuedotjs
    to: /vue
    spotlight: true
    ---
    #title
    Continue in the shared Vue track

    #description
    Shared composable behavior and backend patterns.
    ::::
  :::
::

## What the module adds

The module adds the Nuxt-facing entrypoints and registrations around the shared runtime. Use this list as the public contract for Nuxt app code.

- Root auto-imports from `#convex`: `useConvexQuery`, `useConvexQueries`, `useConvexMutation`, `useConvexAction`, `useConvexPaginatedQuery`, `useConvexAuth`, and `useConvexConnectionState`.
- `#convex`, `#convex/api`, and `#convex/advanced` aliases.
- Optional `#convex/storage` alias with `useConvexStorage` and `useConvexUpload` auto-imports when `storage: true`.
- Optional `useConvexR2Upload` auto-import when `r2: true`.
- Global `ConvexQuery` and `ConvexPaginatedQuery` components.
- Dev-only warnings when the generated Convex API is missing.
- Optional storage scaffolding in `convex/_hub/storage.ts`.

Advanced helpers such as `useConvexClient` and `useConvexHttpClient` stay available through `#convex/advanced`, but they are not auto-imported.

The module does not expose internal runtime helpers or compatibility aliases as part of the public contract.

## What the playground validates

The canonical playground keeps the module contract grounded in a few real flows instead of broad demos.

- `Tasks` validates query, mutation, and pagination against one data model.
- `Convex Storage` validates the scaffolded storage path, metadata persistence, and reactive file URLs.
- `Cloudflare R2` validates `useConvexR2Upload(api.r2)` plus metadata listing and deletion.
- `Session & Diagnostics` validates the supported email/password auth boundary and the current runtime config.

## Minimal setup

Add the module and set the options you need in `nuxt.config.ts`.

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

The module resolves `convex.dir` across Nuxt layers. It prefers a layer that already contains generated Convex files. If that layer is not writable, storage scaffolding falls back to the project layer and keeps imports pointed at the authoritative generated directory.

That behavior matters in layered Nuxt apps, starter kits, and modules that ship Convex files inside a layer.

## What stays shared with Vue core

The module does not reimplement the data layer. Query subscriptions, write helpers, pagination semantics, auth state, and the advanced controller still come from the shared Vue package underneath the wrapper.

::tip
In Nuxt app code, use the `#convex*` aliases and Nuxt auto-imports. Read the Vue track for shared behavior and backend patterns, not for Nuxt-side import paths.
::

## Next steps

- Read [File Storage](/nuxt-module/file-storage) to enable scaffolded storage helpers.
- Read [Cloudflare R2](/nuxt-module/cloudflare-r2) if you want bucket uploads.
- Read [API Reference](/api-reference) for the exact public surface.
