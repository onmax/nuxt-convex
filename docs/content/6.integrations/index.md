---
title: Integrations
description: Add the Nuxt-side integrations documented and exercised in this repo.
---

Use this section after the core module is already installed. These guides cover the supported Nuxt-side extension points around `nuxt-convex`.

## Available integrations

::u-page-section{orientation="vertical"}
#title
Open an integration guide

:::u-page-grid{class="!grid-cols-1 lg:!grid-cols-2 !gap-3"}
::::u-page-card
---
icon: i-lucide-shield
spotlight: true
to: /integrations/better-auth
---
#title
Better Auth

#description
Use Convex as the Better Auth database through the provider and HTTP adapter exported by this repo.
::::

::::u-page-card
---
icon: i-lucide-cloud
spotlight: true
to: /integrations/r2
---
#title
Cloudflare R2

#description
Upload files to R2 through the Convex R2 component and the Nuxt-side upload helper.
::::

:::
::

## Before you start

- Install and verify the core module first through [Getting Started](/getting-started/installation)
- Keep the Nuxt-specific setup in this section
- Use [Convex Patterns](/convex-patterns) and [API Reference](/api-reference) for the shared runtime details
