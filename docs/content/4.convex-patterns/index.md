---
title: Convex Patterns
description: Learn the shared backend model that both the Nuxt and Vue tracks expect from your Convex project.
---

Both frontend tracks in this repo assume the same Convex backend foundations:

- a schema that matches the data you query from the client
- generated API files created by `npx convex dev`
- public queries, mutations, and actions with predictable boundaries
- queries that can render on the server and then stay live over the WebSocket

Use this section to build the mental model behind the framework-specific guides.

## Open a concept page

::card-group
:::card
---
icon: i-lucide-database
to: /convex-patterns/schema
title: 'Design your schema'
---
Define tables, validators, and indexes that support your app-facing queries.
:::

:::card
---
icon: i-lucide-split
to: /convex-patterns/functions
title: 'Design your functions'
---
Split public queries, mutations, and actions by the work they actually do.
:::

:::card
---
icon: i-lucide-radio
to: /convex-patterns/realtime-and-ssr
title: 'Reason about realtime and SSR'
---
Follow a query from the server render to the WebSocket subscription.
:::
::

## Related sections

- Read [Vue](/vue) for shared runtime guides
- Read [Nuxt](/nuxt) for the wrapper-specific contract
