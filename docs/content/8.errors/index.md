---
title: Error Codes
description: Every diagnostic code nuxt-convex and vue-convex print, with what it means and how to fix it.
---

nuxt-convex and vue-convex report setup problems as diagnostics with a stable code. Each one prints why it happened, how to fix it, and a link to its page here:

```txt
[VUE_CONVEX_R0002] Convex is not installed on this app.
├▶ fix: Call app.use(convexVue, { url }) before mounting the app.
╰▶ see: https://nuxt-convex.onmax.me/errors/vue-convex-r0002
```

Production builds drop the text and keep the code and the link. A thrown diagnostic is an `Error` whose `name` is the code.

The letter after the prefix is the area: `C` config, `B` build, `D` deprecation, `R` runtime. Errors from your Convex functions (`ConvexError`) and network failures are not diagnostics: see [Error Handling](/nuxt-module/error-handling).

## nuxt-convex

| Code | Level | Title |
| --- | --- | --- |
| [`NUXT_CONVEX_C0001`](/errors/nuxt-convex-c0001) | error | The `convex` Better Auth database provider was removed |
| [`NUXT_CONVEX_C0002`](/errors/nuxt-convex-c0002) | warning | Convex URL not configured |
| [`NUXT_CONVEX_D0001`](/errors/nuxt-convex-d0001) | deprecation | `convex.server` is deprecated |
| [`NUXT_CONVEX_B0001`](/errors/nuxt-convex-b0001) | warning | Missing convex/_generated |
| [`NUXT_CONVEX_B0002`](/errors/nuxt-convex-b0002) | warning | The storage scaffold lets anyone upload and delete files |
| [`NUXT_CONVEX_B0003`](/errors/nuxt-convex-b0003) | warning | Scaffolding storage functions in the project instead of the layer |
| [`NUXT_CONVEX_R0001`](/errors/nuxt-convex-r0001) | warning | No Convex URL configured at run time |
| [`NUXT_CONVEX_R0002`](/errors/nuxt-convex-r0002) | error | Resolving the Convex token failed |
| [`NUXT_CONVEX_R0003`](/errors/nuxt-convex-r0003) | warning | Failed to load storage refs from the generated Convex API |
| [`NUXT_CONVEX_R0004`](/errors/nuxt-convex-r0004) | warning | Better Auth token request failed |
| [`NUXT_CONVEX_R0005`](/errors/nuxt-convex-r0005) | error | Convex URL is not configured for server routes |
| [`NUXT_CONVEX_R0006`](/errors/nuxt-convex-r0006) | error | The Better Auth proxy has no Convex site URL |
| [`NUXT_CONVEX_R0007`](/errors/nuxt-convex-r0007) | error | Could not reach the Convex site URL |
| [`NUXT_CONVEX_R0008`](/errors/nuxt-convex-r0008) | error | Convex realtime client is not connected (R2 upload) |
| [`NUXT_CONVEX_R0009`](/errors/nuxt-convex-r0009) | error | R2 uploads are only available on the client |

## vue-convex

| Code | Level | Title |
| --- | --- | --- |
| [`VUE_CONVEX_R0001`](/errors/vue-convex-r0001) | error | Convex composables must be called inside setup() |
| [`VUE_CONVEX_R0002`](/errors/vue-convex-r0002) | error | Convex is not installed on this app |
| [`VUE_CONVEX_R0003`](/errors/vue-convex-r0003) | error | Convex realtime client is not connected |
| [`VUE_CONVEX_R0004`](/errors/vue-convex-r0004) | error | Convex HTTP client is not connected |
| [`VUE_CONVEX_R0005`](/errors/vue-convex-r0005) | error | reconfigure() needs a Convex URL |
| [`VUE_CONVEX_R0006`](/errors/vue-convex-r0006) | error | Storage feature is not configured |
| [`VUE_CONVEX_R0007`](/errors/vue-convex-r0007) | error | The upload response did not include a storageId |
| [`VUE_CONVEX_R0008`](/errors/vue-convex-r0008) | error | Uploads are only available on the client |
| [`VUE_CONVEX_R0009`](/errors/vue-convex-r0009) | error | serverAuth.getToken() failed |
