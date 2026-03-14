---
title: Nuxt Docs
description: The Nuxt-focused track for nuxt-convex, with setup, guides, integrations, and module-specific API references.
navigation: false
---

Build Convex into Nuxt with a docs flow that stays Nuxt-first. Start with module setup, move into storage and integrations, and keep the shared Vue API available when you need to understand the lower layer.

::div{class="flex flex-wrap gap-3"}
:u-button{to="/getting-started" label="Start with installation" trailing-icon="i-lucide-arrow-right"}
:u-button{to="/nuxt-module" label="Open module guide" color="neutral" variant="outline"}
::

::card-group

::card{title="Get Started" icon="i-lucide-rocket" to="/getting-started" color="primary"}
Install `nuxt-convex`, connect Convex, and verify the generated API and runtime config.
::

::card{title="Guide" icon="i-lucide-book-open" to="/nuxt-module"}
Learn what the module adds on top of the shared Vue package, including auto-imports and layer-aware resolution.
::

::card{title="Integrations" icon="i-lucide-plug-zap" to="/integrations"}
Add Better Auth and Cloudflare R2 without leaving the Nuxt track.
::

::card{title="Shared API" icon="i-lucide-code-xml" to="/api-reference"}
Jump into the composables and renderless APIs used by the module runtime.
::

::

## Work in this track

- `nuxt-convex` handles aliases, auto-imports, generated API access, and runtime wiring.
- file storage and Cloudflare R2 live here because they depend on module scaffolding and runtime behavior.
- the data layer stays shared with `@onmax/convex-vue`, but this track documents how the Nuxt module exposes it.
