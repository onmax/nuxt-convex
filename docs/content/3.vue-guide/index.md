---
title: Guide
description: "Learn the shared Vue runtime for Convex: plugin setup, query and mutation patterns, pagination, storage, auth, and advanced runtime control."
---

This section is the task-focused guide for `vue-convex`. Use it when you want to build with the shared Vue runtime or understand the behavior that also sits underneath the Nuxt module.

## Read this section in order if you are new

1. [Installation](/vue-guide/installation)
2. [Queries](/vue-guide/queries)
3. [Mutations & Actions](/vue-guide/mutations-and-actions)
4. [Pagination](/vue-guide/pagination)

Then branch into:

- [File Storage](/vue-guide/file-storage)
- [Controller](/vue-guide/controller)
- [Authentication](/vue-guide/authentication)
- [Connection State](/vue-guide/connection-state)
- [Server Rendering](/vue-guide/server-rendering), only if you run your own SSR

## Read by task

::card-group
:::card
---
icon: i-lucide-download
to: /vue-guide/installation
title: 'Install and verify'
---
Register the plugin and run the first query.
:::

:::card
---
icon: i-lucide-search
to: /vue-guide/queries
title: 'Subscribe to data'
---
Use reactive arguments, `status` and errors, auth modes and skip logic.
:::

:::card
---
icon: i-lucide-list
to: /vue-guide/pagination
title: 'Build paginated feeds'
---
Load more results, reset on filter changes, and use optimistic helpers.
:::

:::card
---
icon: i-lucide-sliders-horizontal
to: /vue-guide/controller
title: 'Manage the connection'
---
Connect later, reconfigure the runtime, or work with the raw clients.
:::
::

## Related sections

- Read [Convex Patterns](/convex-patterns) for the backend model behind these guides
- Read [API Reference](/api-reference) when you need exact signatures instead of walkthroughs
