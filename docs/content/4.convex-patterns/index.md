---
title: Convex Patterns
description: Follow the shared backend patterns that both the Nuxt module and the Vue package assume when they call Convex.
---

Both frontend tracks in this repo expect the same Convex backend fundamentals: a schema, generated APIs, and public functions that the browser can call.

::u-page-section
#title
Open the backend patterns

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 md:col-span-1
    spotlight: true
    to: /convex-patterns/schema
    ---
    #title
    Define your schema

    #description
    Learn how tables and indexes shape the API that your frontend calls.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 md:col-span-1
    spotlight: true
    to: /convex-patterns/functions
    ---
    #title
    Split your functions

    #description
    Keep queries, mutations, and actions predictable so the frontend helpers stay simple.
    ::::

    ::::u-page-card
    ---
    class: col-span-2
    spotlight: true
    to: /convex-patterns/realtime-and-ssr
    ---
    #title
    Handle realtime and SSR

    #description
    Understand how Convex updates interact with server rendering and client hydration.
    ::::
  :::
::

## See what this section covers

- Schema definitions and indexes.
- Query, mutation, and action boundaries.
- Realtime updates and SSR behavior.

## Why this matters

The frontend helpers in this repo are thin wrappers over Convex. When the backend shape is clear, the Nuxt and Vue layers stay predictable.

::tip
Read this section alongside the Vue track. The Nuxt module builds on these same backend expectations.
::

## Next steps

- Read [Schema](/convex-patterns/schema) for table and index definitions.
- Read [Functions](/convex-patterns/functions) for queries, mutations, and actions.
- Read [Realtime and SSR](/convex-patterns/realtime-and-ssr) for rendering behavior.
