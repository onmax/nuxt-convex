---
title: Troubleshooting
description: Diagnose common setup, SSR, auth and deployment issues in nuxt-convex and vue-convex.
---

Each entry starts from the symptom you see. Messages in quotes are what the module or the runtime logs.

## `#convex/api` cannot be resolved

**Cause:** `convex/_generated/` doesn't exist yet, or it's outside the resolved `convex.dir`. In development the module warns "Missing convex/_generated".

**Fix:** run `npx convex dev` in the project that owns the `convex/` directory. A running `nuxt dev` picks up the generated files without a restart. If your Convex functions live in a layer or another folder, set `convex.dir`.

## "Convex URL not configured"

**Cause:** no URL was found in `convex.url`, `CONVEX_URL`, `NUXT_PUBLIC_CONVEX_URL`, `VITE_CONVEX_URL`, or (in development) `.env.local`. The app starts disconnected and every query stays `pending`.

**Fix:** in development, run `npx convex dev`, which writes `.env.local`. For builds, `.env.local` isn't read: set `CONVEX_URL` in the build environment, or `NUXT_PUBLIC_CONVEX_URL` at run time. See [Local Development](/getting-started/local-development#environment-variables).

## Production talks to the wrong deployment

**Cause:** the URL was baked in at build time from a developer's environment, or the run-time override only covers one of the two URLs.

**Fix:** set `NUXT_PUBLIC_CONVEX_URL` in the production environment. With the Better Auth proxy, set `NUXT_PUBLIC_CONVEX_SITE_URL` too if a site URL was baked into the build. Check `runtimeConfig.public.convex` in Nuxt DevTools or a server route.

## An authenticated page renders signed out on the server

**Cause:** the server found no token for the request. With Better Auth, the request has no `*session_token` cookie, or the token request to `<basePath>/convex/token` failed ("Better Auth token request failed" in the server log). Without a provider, nothing set `ctx.token` in the `convex:token` hook.

**Fix:**

- Check that `auth.provider` resolved to `better-auth`: it does by default when `@nuxtjs/better-auth` is installed.
- Request `/api/auth/convex/token` in the browser while signed in. It should return `{ "token": "..." }`.
- For another auth provider, set the token in the [`convex:token` hook](/nuxt-module/authenticated-ssr#custom-providers).
- As a stopgap, `{ server: false }` on the query makes it load in the browser only.

## "Set CONVEX_SITE_URL (or convex.siteUrl) to proxy auth requests to Convex"

**Cause:** the Better Auth proxy couldn't work out where Better Auth runs. The site URL is derived automatically only from `*.convex.cloud` URLs and local backends.

**Fix:** set `CONVEX_SITE_URL` at build time or `NUXT_PUBLIC_CONVEX_SITE_URL` at run time, for example for a custom domain or a self-hosted backend.

## Auth requests answer 502 "Could not reach …"

**Cause:** the proxy couldn't connect to the Convex site URL: a wrong `siteUrl`, a local backend that isn't running, or a network policy on the host.

**Fix:** open `<siteUrl>/api/auth/ok` directly. If it doesn't answer, fix the URL or start `npx convex dev`.

## Failed to decrypt private key

**Cause:** `BETTER_AUTH_SECRET` changed on the Convex deployment. Better Auth can no longer decrypt the JWT signing keys it stored with the old secret, so every token request fails.

**Fix:** delete the stored keys. Better Auth creates new ones on the next request:

```bash [Terminal]
npx convex run --component betterAuth adapter:deleteMany '{"input":{"model":"jwks"},"paginationOpts":{"numItems":100,"cursor":null}}'
```

Add `--prod`, or use a production deploy key, for the production deployment.

## The build fails with "The `convex` Better Auth database provider was removed"

**Cause:** `auth.database.provider: 'convex'` is set in `nuxt.config.ts`. That provider, and `createConvexHttpAdapter` from `nuxt-convex/better-auth`, no longer exist.

**Fix:** run Better Auth inside Convex with `@convex-dev/better-auth` and set `auth.clientOnly: true`. See [Better Auth](/integrations/better-auth#migrating-from-the-convex-database-provider).

## `npx convex dev` fails to bundle `better-auth/plugins/oidc-provider`

**Cause:** `better-auth` 1.7 or later is installed. `@convex-dev/better-auth@0.12.5` needs 1.6.

**Fix:** pin `better-auth@1.6.33` and allow it in your peer rules. See [the version warning](/integrations/better-auth#install-the-tested-stack).

## "`convex.server` is deprecated, use `convex.ssr` instead"

**Cause:** `nuxt.config.ts` uses the old option name.

**Fix:** rename `convex.server` to `convex.ssr`. The per-query option keeps its name: `useConvexQuery(api.x, {}, { server: false })`.

## "convex/_hub/storage.ts lets anyone upload and delete files"

**Cause:** your storage functions were scaffolded by an older release, without auth checks.

**Fix:** delete `convex/_hub/storage.ts` to have the module regenerate it with checks, or add `ctx.auth.getUserIdentity()` checks yourself. Then add ownership checks: see [File Storage](/nuxt-module/file-storage#review-the-generated-scaffold).

## `useConvexStorage` or `useConvexUpload` is not available

**Cause:** storage isn't enabled. In Vue, "Storage feature is not configured. Install convexVueStorage first."

**Fix:** set `convex.storage: true` in Nuxt. In Vue, install `convexVueStorage` from `vue-convex/storage` with `generateUploadUrl`, `getUrl` and `remove`.

## `useConvexR2Upload` is not available

**Cause:** `convex.r2` isn't enabled.

**Fix:** set `convex.r2: true`, install `@convex-dev/r2`, and register the component. See [Cloudflare R2](/nuxt-module/cloudflare-r2).

## "Convex realtime client is not connected"

**Cause:** a mutation, action, upload or `useConvexClient()` ran without a browser client: during SSR, or before the app has a URL (a Vue app installed without `url` that hasn't called `connect()` yet).

**Fix:** call mutations and actions from event handlers, not during setup on the server. In server routes, use [`serverConvexMutation`](/nuxt-module/server-routes). In Vue, `connect({ url })` first. Queries don't throw in this state: they stay `pending` until a client connects.

## "Convex composables must be called inside setup(), a plugin, or app.runWithContext()"

**Cause:** a composable ran outside an injection context, for example in a `setTimeout`, a store defined outside the app, or after an `await` in a plain (non-`<script setup>`) async function.

**Fix:** call composables in `setup()` or a plugin, or wrap the call in `app.runWithContext()` (`nuxtApp.runWithContext()` in Nuxt).

## A query stays `pending` in the server HTML

**Cause:** only awaited queries run during SSR. A query that isn't awaited, a query with `{ server: false }`, every query with `convex.ssr: false`, and every `useConvexQueries` entry render as not loaded yet.

**Fix:** `await` the query if it must be in the HTML. See [SSR & Hydration](/nuxt-module/ssr-and-hydration).

## A signed-in page was served to another user

**Cause:** a Nitro `cache`, `swr` or `isr` route rule, or `cachedEventHandler`, stored a page rendered with a user's token. Nitro's cache ignores the `Cache-Control: private` and `Vary: Cookie` headers the module sets.

**Fix:** remove those rules from routes signed-in users visit, or force those routes anonymous in the `convex:token` hook. See [Caching](/nuxt-module/authenticated-ssr#caching).

## A paginated query doesn't render on the server

**Cause:** it isn't awaited, or it has `{ server: false }`.

**Fix:** `await useConvexPaginatedQuery(...)` fetches the first page during SSR and hydrates it. `<ConvexPaginatedQuery>` does that for you.
