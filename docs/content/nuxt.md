---
title: Nuxt Docs
description: The Nuxt-focused track for nuxt-convex, with setup, guides, integrations, and module-specific API references.
navigation: false
---

# Nuxt Docs

Build Convex into Nuxt with a docs flow that stays Nuxt-first. Start with module setup, move into storage and integrations, and keep the shared Vue API available when you need to understand the lower layer.

:u-button{to="/getting-started" label="Start with installation" trailing-icon="i-lucide-arrow-right"}
:u-button{to="/nuxt-module" label="Open module guide" color="neutral" variant="outline"}

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

## Work in this track

- `nuxt-convex` handles aliases, auto-imports, generated API access, and runtime wiring.
- file storage and Cloudflare R2 live here because they depend on module scaffolding and runtime behavior.
- the data layer stays shared with `@onmax/convex-vue`, but this track documents how the Nuxt module exposes it.
