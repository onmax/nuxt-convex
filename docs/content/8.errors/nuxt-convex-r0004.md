---
title: 'NUXT_CONVEX_R0004: Better Auth token request failed'
description: 'The server asked Better Auth for the request''s Convex token and got an error status other than 401 or 403. The page renders anonymously.'
navigation: false
---

Code: `NUXT_CONVEX_R0004`<br>
Level: warning<br>
Package: `nuxt-convex`

## What this error means

The server asked Better Auth for the request's Convex token and got an error status other than 401 or 403. The page renders anonymously.

## Why this happens

- `@convex-dev/better-auth` is not set up in the Convex deployment.
- `BETTER_AUTH_SECRET` changed and Better Auth can no longer decrypt its keys (see [Troubleshooting](/troubleshooting#failed-to-decrypt-private-key)).
- `convex.auth.basePath` doesn't match the Better Auth base path.

## How to fix it

Request `/api/auth/convex/token` in the browser while signed in. It should return `{ "token": "..." }`. If it fails, fix the Better Auth setup in your Convex deployment. See [Better Auth](/integrations/better-auth).
