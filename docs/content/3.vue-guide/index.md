---
title: Guide
description: Learn the shared Vue runtime for Convex: plugin setup, query and mutation patterns, pagination, storage, auth, and advanced runtime control.
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

## Read by task

::u-page-section{orientation="vertical"}
#title
Open a guide

:::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
::::u-page-card
---
icon: i-lucide-download
spotlight: true
to: /vue-guide/installation
---
#title
Install and verify

#description
Register the plugin and run the first query.
::::

::::u-page-card
---
icon: i-lucide-search
spotlight: true
to: /vue-guide/queries
---
#title
Subscribe to data

#description
Use reactive arguments, SSR-aware reads, and skip logic.
::::

::::u-page-card
---
icon: i-lucide-list
spotlight: true
to: /vue-guide/pagination
---
#title
Build paginated feeds

#description
Load more results, reset on filter changes, and use optimistic helpers.
::::

::::u-page-card
---
icon: i-lucide-sliders-horizontal
spotlight: true
to: /vue-guide/controller
---
#title
Manage the connection

#description
Connect later, reconfigure the runtime, or work with the raw clients.
::::

:::
::

## Related sections

- Read [Convex Patterns](/convex-patterns) for the backend model behind these guides
- Read [API Reference](/api-reference) when you need exact signatures instead of walkthroughs
