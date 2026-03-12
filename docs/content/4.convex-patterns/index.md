---
title: Convex Patterns
description: Follow the shared backend patterns that both the Nuxt module and the Vue package assume when they call Convex.
---

Both frontend tracks in this repo expect the same Convex backend fundamentals: a schema, generated APIs, and public functions that the browser can call.

## Covered in this section

- schema definitions and indexes
- query, mutation, and action boundaries
- realtime updates and SSR behavior

## Why this matters

The frontend helpers in this repo are thin wrappers over Convex. When the backend shape is clear, the Nuxt and Vue layers stay predictable.

## Next steps

- Read [Schema](/convex-patterns/schema) for table and index definitions.
- Read [Functions](/convex-patterns/functions) for queries, mutations, and actions.
- Read [Realtime and SSR](/convex-patterns/realtime-and-ssr) for rendering behavior.
