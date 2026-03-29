---
title: Nuxt Module
description: Learn the public Nuxt wrapper contract for nuxt-convex: config, aliases, auto-imports, storage scaffolding, and components.
---

This section documents what `nuxt-convex` adds on top of the shared Vue runtime. Use it when you need the exact Nuxt-facing contract rather than the shared composable behavior.

## What this section covers

- the `convex` module configuration key
- `#convex`, `#convex/api`, `#convex/advanced`, and optional `#convex/storage`
- Nuxt auto-imports
- global renderless components
- storage scaffolding
- the Nuxt-side Cloudflare R2 helper

::u-page-section{orientation="vertical"}
#title
Open a Nuxt-specific guide

:::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
::::u-page-card
---
icon: i-lucide-file-code
spotlight: true
to: /api-reference/module-configuration
---
#title
Review module configuration

#description
Look up the supported config keys, defaults, env fallback order, and runtime behavior.
::::

::::u-page-card
---
icon: i-lucide-hard-drive
spotlight: true
to: /nuxt-module/file-storage
---
#title
Set up Convex storage

#description
Enable storage scaffolding and use the Nuxt storage alias in app code.
::::

::::u-page-card
---
icon: i-lucide-cloud
spotlight: true
to: /nuxt-module/cloudflare-r2
---
#title
Set up Cloudflare R2

#description
Enable the Nuxt-only upload helper for the Convex R2 component.
::::

::::u-page-card
---
icon: i-lucide-book-open-text
spotlight: true
to: /api-reference/virtual-modules
---
#title
Review virtual modules

#description
Check which aliases exist by default and which ones depend on optional features.
::::

:::
::

## Related sections

- Read [Nuxt](/nuxt) for the top-level Nuxt track
- Read [Integrations](/integrations) for Better Auth and R2
- Read [Vue](/vue) for shared composable behavior
