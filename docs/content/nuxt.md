---
title: Nuxt Docs
description: The Nuxt-focused track for nuxt-convex, with setup, guides, integrations, and module-specific API references.
navigation: false
---

## ::u-page-hero

orientation: vertical
headline: Nuxt Track
title: Build Convex into Nuxt with a docs flow that stays Nuxt-first.
description: Start with module setup, move into storage and integrations, and keep the shared Vue API available when you need to understand the lower layer.
links:

- label: Start with installation
  to: /getting-started
  trailingIcon: i-lucide-arrow-right
- label: Open module guide
  to: /nuxt-module
  color: neutral
  variant: outline

---

::

::u-page-grid

## ::u-page-card

title: Get Started
description: Install `nuxt-convex`, connect Convex, and verify the generated API and runtime config.
icon: i-lucide-rocket
to: /getting-started
highlight: true
highlightColor: primary
spotlight: true

::

## ::u-page-card

title: Guide
description: Learn what the module adds on top of the shared Vue package, including auto-imports and layer-aware resolution.
icon: i-lucide-book-open
to: /nuxt-module
spotlight: true

::

## ::u-page-card

title: Integrations
description: Add Better Auth and Cloudflare R2 without leaving the Nuxt track.
icon: i-lucide-plug-zap
to: /integrations
spotlight: true

::

## ::u-page-card

title: Shared API
description: Jump into the composables and renderless APIs used by the module runtime.
icon: i-lucide-code-xml
to: /api-reference
spotlight: true

::

::

## ::u-page-section

title: Work In This Track
description: These are the areas that matter most when you are integrating Convex into a Nuxt application.
orientation: vertical

---

::u-page-grid

## ::u-page-feature

title: Module setup
description: `nuxt-convex` handles aliases, auto-imports, generated API access, and runtime wiring.
icon: i-lucide-layers-3

::

## ::u-page-feature

title: Storage and deploy concerns
description: File storage and Cloudflare R2 live in the Nuxt track because they depend on module scaffolding and runtime behavior.
icon: i-lucide-cloud-upload

::

## ::u-page-feature

title: Shared composables
description: The data layer stays shared with `@onmax/convex-vue`, but the Nuxt track documents how the module exposes it.
icon: i-lucide-component

::

::
