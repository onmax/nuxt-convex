---
title: Integrations
description: Extend nuxt-convex with the adjacent tools that this repo currently documents and exercises.
---

The integration guides describe the extension points that the Nuxt playground validates today. Use them after the core `nuxt-convex` setup is already in place and you want a supported path for auth or bucket storage.

The canonical validation surface lives in the playground dashboard:

- `Tasks`
- `Convex Storage`
- `Cloudflare R2`
- `Session & Diagnostics`

The integration pages below explain the parts of that dashboard that depend on external packages or extra environment.

::u-page-section
#title
Open an integration guide

  :::u-page-grid
    ::::u-page-card
    ---
    class: col-span-2 md:col-span-1
    spotlight: true
    to: /integrations/better-auth
    ---
    #title
    Add Better Auth

    #description
    Connect Better Auth to the shipped provider hook and HTTP adapter, with the current support boundary called out explicitly.
    ::::

    ::::u-page-card
    ---
    class: col-span-2 md:col-span-1
    spotlight: true
    to: /integrations/r2
    ---
    #title
    Add Cloudflare R2

    #description
    Extend file uploads with R2 when you need bucket storage beyond the default Convex storage flow.
    ::::
  :::
::

## See what is included

- [Better Auth](/integrations/better-auth)
- [R2](/integrations/r2)

::tip
Most integrations in this repo are Nuxt-first because the module owns the surrounding runtime wiring. The shared Vue package still provides the underlying data layer, but the supported app-facing path stays in Nuxt.
::
