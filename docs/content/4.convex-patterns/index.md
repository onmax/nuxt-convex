---
title: Convex Patterns
description: Follow the shared backend patterns that both the Nuxt module and the Vue package assume when they call Convex.
---

Both frontend tracks in this repo expect the same Convex backend fundamentals: a schema, generated APIs, and public functions that the browser can call.

::u-page-section{align="left"}
#title
Open the backend patterns

:::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
::::u-page-card

---

icon: i-lucide-database
spotlight: true
to: /convex-patterns/schema

---

#title
Define your schema

    #description
    Tables and indexes that shape the frontend API.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-split
    spotlight: true
    to: /convex-patterns/functions
    ---
    #title
    Split your functions

    #description
    Queries, mutations, and actions boundaries.
    ::::

    ::::u-page-card
    ---
    icon: i-lucide-radio
    spotlight: true
    to: /convex-patterns/realtime-and-ssr
    ---
    #title
    Handle realtime and SSR

    #description
    Convex updates with server rendering and hydration.
    ::::

:::
::

## Why this matters

The frontend helpers in this repo are thin wrappers over Convex. When the backend shape is clear, the Nuxt and Vue layers stay predictable.

::tip
Read this section alongside the Vue track. The Nuxt module builds on these same backend expectations.
::
