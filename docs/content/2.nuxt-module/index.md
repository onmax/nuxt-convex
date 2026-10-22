---
title: Nuxt Module
description: "Guides for what nuxt-convex adds on top of the Vue runtime: SSR, authenticated rendering, server routes, errors, storage, deployment and security."
---

`nuxt-convex` installs the shared Vue runtime and wires it into Nuxt: server rendering with payload hydration, the request's user on the server, Nitro helpers, aliases and auto-imports.

## What the module adds

- the `convex` key in `nuxt.config.ts` ([reference](/api-reference/module-configuration))
- the public `#convex`, `#convex/api`, and `#convex/advanced` aliases, plus the Optional `#convex/storage` alias when storage is enabled, and `#convex/server` in server code
- auto-imports for the composables, and the `ConvexQuery`, `ConvexPaginatedQuery` and auth components
- SSR for awaited queries, hydrated from the Nuxt payload
- a server-side token for the request's user, from Better Auth or your own `convex:token` hook
- server helpers such as `serverConvexQuery` and `requireConvexAuth`
- storage scaffolding and the Cloudflare R2 upload helper

## Guides

::card-group
:::card
---
icon: i-lucide-server
to: /nuxt-module/ssr-and-hydration
title: SSR & Hydration
---
How awaited queries render on the server, hydrate, and hand off to the WebSocket.
:::

:::card
---
icon: i-lucide-shield-check
to: /nuxt-module/authenticated-ssr
title: Authenticated SSR
---
Render signed-in pages with Better Auth or your own provider, and keep them out of shared caches.
:::

:::card
---
icon: i-lucide-route
to: /nuxt-module/server-routes
title: Server Routes
---
Call Convex as the request's user from Nitro with `serverConvexQuery` and friends.
:::

:::card
---
icon: i-lucide-triangle-alert
to: /nuxt-module/error-handling
title: Error Handling
---
Read `status` and `error`, match `ConvexError` codes, and map errors in server routes.
:::

:::card
---
icon: i-lucide-hard-drive
to: /nuxt-module/file-storage
title: File Storage
---
Scaffold the storage functions and upload files with progress.
:::

:::card
---
icon: i-lucide-cloud
to: /nuxt-module/cloudflare-r2
title: Cloudflare R2
---
Upload to R2 through the Convex R2 component.
:::

:::card
---
icon: i-lucide-rocket
to: /nuxt-module/deployment
title: Deployment
---
Deploy Convex first, then ship to Vercel, Cloudflare Workers or Node.
:::

:::card
---
icon: i-lucide-lock
to: /nuxt-module/security
title: Security
---
What stays on the server, and the checks that remain your job.
:::
::

## Related sections

- [Getting Started](/getting-started) to install the module
- [Integrations](/integrations) for Better Auth and R2
- [Vue Guide](/vue-guide) for the composables shared with plain Vue
