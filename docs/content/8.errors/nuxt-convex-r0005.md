---
title: 'NUXT_CONVEX_R0005: Convex URL is not configured for server routes'
description: 'A server helper (serverConvexQuery, useConvexServer and the rest) ran without a Convex URL. The request answers 500.'
navigation: false
---

Code: `NUXT_CONVEX_R0005`<br>
Level: error<br>
Package: `nuxt-convex`

## What this error means

A server helper (`serverConvexQuery`, `useConvexServer` and the rest) ran without a Convex URL. The request answers 500.

## Why this happens

- The production server has no `NUXT_PUBLIC_CONVEX_URL`, and no URL was baked in at build time.

## How to fix it

Set `CONVEX_URL` in the build environment, or `NUXT_PUBLIC_CONVEX_URL` at run time.
