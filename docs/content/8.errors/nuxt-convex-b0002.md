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

If you've customized `convex/_hub/storage.ts`, keep the file and add authentication and ownership checks in place. If the scaffold is unmodified, you can delete it and let the module regenerate it with auth checks on the next start, then add ownership checks. See [File Storage](/nuxt-module/file-storage#review-the-generated-scaffold).
