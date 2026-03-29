---
title: Convex Patterns
description: Learn the shared backend model that both the Nuxt and Vue tracks expect from your Convex project.
---

Both frontend tracks in this repo assume the same Convex backend foundations:

- a schema that matches the data you query from the client
- generated API files created by `npx convex dev`
- public queries, mutations, and actions with predictable boundaries
- a clear distinction between SSR-friendly reads and client-only realtime flows

Use this section to build the mental model behind the framework-specific guides.

::u-page-section{orientation="vertical"}
#title
Open a concept page

:::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
::::u-page-card
---
icon: i-lucide-database
spotlight: true
to: /convex-patterns/schema
---
#title
Design your schema

#description
Define tables, validators, and indexes that support your app-facing queries.
::::

::::u-page-card
---
icon: i-lucide-split
spotlight: true
to: /convex-patterns/functions
---
#title
Design your functions

#description
Split public queries, mutations, and actions by the work they actually do.
::::

::::u-page-card
---
icon: i-lucide-radio
spotlight: true
to: /convex-patterns/realtime-and-ssr
---
#title
Reason about realtime and SSR

#description
Understand which reads can prefetch on the server and which flows stay client-only.
::::

:::
::

## Related sections

- Read [Vue](/vue) for shared runtime guides
- Read [Nuxt](/nuxt) for the wrapper-specific contract
