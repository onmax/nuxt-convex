---
title: Nuxt Module
description: "Learn the public Nuxt wrapper contract for nuxt-convex: config, aliases, auto-imports, storage scaffolding, and components."
---

This section documents what `nuxt-convex` adds on top of the shared Vue runtime. Use it when you need the exact Nuxt-facing contract rather than the shared composable behavior.

## What this section covers

- the `convex` module configuration key
- `#convex`, `#convex/api`, `#convex/advanced`, and optional `#convex/storage`
- Nuxt auto-imports
- global renderless components
- storage scaffolding
- the Nuxt-side Cloudflare R2 helper

In other words, this section covers the public `#convex`, `#convex/api`, and `#convex/advanced` aliases, plus the Optional `#convex/storage` alias when the storage feature is enabled.

## Open a Nuxt-specific guide

::card-group
:::card
---
icon: i-lucide-file-code
to: /api-reference/module-configuration
title: 'Review module configuration'
---
Look up the supported config keys, defaults, env fallback order, and runtime behavior.
:::

:::card
---
icon: i-lucide-hard-drive
to: /nuxt-module/file-storage
title: 'Set up Convex storage'
---
Enable storage scaffolding and use the Nuxt storage alias in app code.
:::

:::card
---
icon: i-lucide-cloud
to: /nuxt-module/cloudflare-r2
title: 'Set up Cloudflare R2'
---
Enable the Nuxt-only upload helper for the Convex R2 component.
:::

:::card
---
icon: i-lucide-book-open-text
to: /api-reference/virtual-modules
title: 'Review virtual modules'
---
Check which aliases exist by default and which ones depend on optional features.
:::
::

## Related sections

- Read [Nuxt](/nuxt) for the top-level Nuxt track
- Read [Integrations](/integrations) for Better Auth and R2
- Read [Vue](/vue) for shared composable behavior
