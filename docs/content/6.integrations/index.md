---
title: Integrations
description: Add the Nuxt-side integrations documented and exercised in this repo.
---

Use this section after the core module is already installed. These guides cover the supported Nuxt-side extension points around `nuxt-convex`.

## Available integrations

::card-group
:::card
---
icon: i-lucide-shield
to: /integrations/better-auth
title: 'Better Auth'
---
Run Better Auth inside Convex, proxy it through your app, and render signed-in pages on the server.
:::

:::card
---
icon: i-lucide-cloud
to: /integrations/r2
title: 'Cloudflare R2'
---
Upload files to R2 through the Convex R2 component and the Nuxt-side upload helper.
:::
::

## Before you start

- Install and verify the core module first through [Getting Started](/getting-started/installation)
- Keep the Nuxt-specific setup in this section
- Use [Authenticated SSR](/nuxt-module/authenticated-ssr) for providers other than Better Auth
- Use [Convex Patterns](/convex-patterns) and [API Reference](/api-reference) for the shared runtime details
