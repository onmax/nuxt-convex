---
title: Integrations
description: Extend nuxt-convex with the adjacent tools that this repo currently documents and exercises.
---

The integration guides describe real extension points in this repository. They focus on the surrounding tools that matter once the core Convex wiring is already in place.

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
    Connect Better Auth to the shipped provider hook and HTTP adapter, with the current dependency constraints called out explicitly.
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
    Extend file uploads with R2 when you need bucket storage beyond the default Convex flow.
    ::::
  :::
::

## See what is included

- [Better Auth](/integrations/better-auth)
- [R2](/integrations/r2)

::tip
Most integrations in this repo are Nuxt-first because the module owns the surrounding runtime wiring. The shared Vue package still provides the underlying data layer.
::
