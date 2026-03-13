---
title: Vue Docs
description: The Vue-focused track for @onmax/convex-vue, centered on plugin setup, manual initialization, and shared composables.
navigation: false
---

# Vue Docs

Work directly with the shared Convex Vue package. This track stays focused on plugin setup, runtime control, and the composables you use in standalone Vue applications.

:u-button{to="/vue-core/installation" label="Install the Vue package" trailing-icon="i-lucide-arrow-right"}
:u-button{to="/vue-core/manual-initialization" label="Read manual initialization" color="neutral" variant="outline"}

::card-group

::card{title="Get Started" icon="i-lucide-rocket" to="/vue-core/installation" color="primary"}
Install `@onmax/convex-vue`, register the plugin, and connect a deployment URL in app startup.
::

::card{title="Manual Initialization" icon="i-lucide-play-circle" to="/vue-core/manual-initialization"}
Delay client creation when the deployment URL or auth state only exists after app startup.
::

::card{title="Composables" icon="i-lucide-function-square" to="/api-reference"}
Browse the shared composables exposed by `@onmax/convex-vue`.
::

::card{title="Convex Patterns" icon="i-lucide-sparkles" to="/convex-patterns"}
Revisit schema, functions, and realtime behavior from the perspective of the underlying shared layer.
::

::

## Work in this track

- Vue apps install and configure `convexVue` directly, which makes runtime control explicit.
- you can defer client initialization when your deployment URL is not known up front.
- the composables and helpers here are the same lower-level primitives used by the Nuxt module.
