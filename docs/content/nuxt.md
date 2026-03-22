---
title: Nuxt
description: The Nuxt-focused track for nuxt-convex, with setup, guides, integrations, and module-specific API references.
navigation: false
---

Use this track when your app runs on Nuxt. It covers the `nuxt-convex` module, the public `#convex*` aliases, the Nuxt auto-imports, and the integrations that depend on Nuxt-specific runtime behavior.

Move into the Vue track when you need the shared composable semantics or the backend patterns that both runtimes consume.

The Nuxt playground is the canonical validation harness for this track. Its `Tasks`, `Convex Storage`, `Cloudflare R2`, and `Session & Diagnostics` sections are the reference flows that these docs describe.

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
