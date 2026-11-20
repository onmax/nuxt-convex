---
title: 'NUXT_CONVEX_B0002: The storage scaffold lets anyone upload and delete files'
description: 'convex/_hub/storage.ts was scaffolded by an older release, without auth checks. Anyone can upload and delete files through it.'
navigation: false
---

Code: `NUXT_CONVEX_B0002`<br>
Level: warning<br>
Package: `nuxt-convex`

## What this error means

`convex/_hub/storage.ts` was scaffolded by an older release, without auth checks. Anyone can upload and delete files through it.

## Why this happens

- The file was generated before the scaffold checked `ctx.auth.getUserIdentity()`.

## How to fix it

Delete `convex/_hub/storage.ts`. The module regenerates it with auth checks on the next start. Then add ownership checks: see [File Storage](/nuxt-module/file-storage#review-the-generated-scaffold).
