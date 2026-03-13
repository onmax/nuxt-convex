---
title: Vue Docs
description: The Vue-focused track for @onmax/convex-vue, centered on plugin setup, manual initialization, and shared composables.
navigation: false
---

## ::u-page-hero

orientation: vertical
headline: Vue Track
title: Work directly with the shared Convex Vue package.
description: This track stays focused on plugin setup, runtime control, and the composables you use in standalone Vue applications.
links:

- label: Install the Vue package
  to: /vue-core/installation
  trailingIcon: i-lucide-arrow-right
- label: Read manual initialization
  to: /vue-core/manual-initialization
  color: neutral
  variant: outline

---

::

::u-page-grid

## ::u-page-card

title: Get Started
description: Install `@onmax/convex-vue`, register the plugin, and connect a deployment URL in app startup.
icon: i-lucide-rocket
to: /vue-core/installation
highlight: true
highlightColor: primary
spotlight: true

::

## ::u-page-card

title: Manual Initialization
description: Delay client creation when the deployment URL or auth state only exists after app startup.
icon: i-lucide-play-circle
to: /vue-core/manual-initialization
spotlight: true

::

## ::u-page-card

title: Composables
description: Browse the shared composables exposed by `@onmax/convex-vue`.
icon: i-lucide-function-square
to: /api-reference
spotlight: true

::

## ::u-page-card

title: Convex Patterns
description: Revisit schema, functions, and realtime behavior from the perspective of the underlying shared layer.
icon: i-lucide-sparkles
to: /convex-patterns
spotlight: true

::

::

## ::u-page-section

title: Work In This Track
description: The Vue track stays close to the plugin and composable layer without pulling in Nuxt-specific conventions.
orientation: vertical

---

::u-page-grid

## ::u-page-feature

title: Plugin ownership
description: Vue apps install and configure `convexVue` directly, which makes runtime control explicit.
icon: i-lucide-plug

::

## ::u-page-feature

title: Manual lifecycle
description: You can defer client initialization when your deployment URL is not known up front.
icon: i-lucide-sliders-horizontal

::

## ::u-page-feature

title: Shared API surface
description: The composables and helpers documented here are the same lower-level primitives used by the Nuxt module.
icon: i-lucide-code-2

::

::
