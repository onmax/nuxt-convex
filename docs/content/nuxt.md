---
title: Nuxt
description: The Nuxt-focused track for nuxt-convex, with setup, guides, integrations, and module-specific API references.
navigation: false
---

The `nuxt-convex` module wraps the Vue composables with auto-imports, `#convex` virtual modules, and Nuxt-specific integrations like file storage, Cloudflare R2, and Better Auth.

For shared composable behavior and backend patterns, see the [Vue track](/vue).

::u-page-section{align="left"}
#title
Start in the Nuxt layer

#description
Module setup, runtime helpers, and Nuxt-specific integrations.

:::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
::::u-page-card

---

icon: i-lucide-download
spotlight: true
to: /getting-started

---

#title
Install the module

    #description
    Install `nuxt-convex` and generate the typed API.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-settings
    spotlight: true
    to: /nuxt-module
    ---
    #title
    Configure the wrapper

    #description
    Aliases, auto-imports, runtime setup, and resolution.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-plug
    spotlight: true
    to: /integrations
    ---
    #title
    Add integrations

    #description
    Better Auth and Cloudflare R2 wiring.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-arrow-right-left
    spotlight: true
    to: /vue
    ---
    #title
    Open the shared Vue layer

    #description
    Composable details and backend patterns.
    ::::

:::
::

## Understand what the Nuxt layer owns

- `nuxt-convex` owns aliases, auto-imports, generated API access, and runtime wiring.
- File storage and Cloudflare R2 live here because they depend on module scaffolding and Nuxt runtime behavior.
- Better Auth lives here because the provider hook and session wiring depend on the Nuxt server.
- The shared query, mutation, pagination, auth, and controller behavior still lives in the Vue package.

::tip
Use the Vue track to learn shared composable behavior. Use the Nuxt track to learn the app-facing wrapper contract.
::
