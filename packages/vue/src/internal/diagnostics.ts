import { createConsoleReporter, defineDiagnostics, defineProdDiagnostics } from 'nostics'

const docsBase = (code: string): string => `https://nuxt-convex.onmax.me/errors/${code.toLowerCase().replaceAll('_', '-')}`

/**
 * Codes that are thrown or returned as errors. No reporters: the caller throws, so a reporter would print it twice.
 * Production builds keep the code and the docs link but drop the text.
 */
// eslint-disable-next-line node/prefer-global/process -- the consumer's bundler replaces process.env.NODE_ENV
export const errors = process.env.NODE_ENV === 'production'
  ? /* @__PURE__ */ defineProdDiagnostics({ docsBase })
  : /* @__PURE__ */ defineDiagnostics({
      docsBase,
      codes: {
        VUE_CONVEX_R0001: {
          why: 'Convex composables must be called inside setup(), a plugin, or app.runWithContext().',
          fix: 'Move the call into setup() or a composable that setup() calls, or wrap it in app.runWithContext().',
        },
        VUE_CONVEX_R0002: {
          why: 'Convex is not installed on this app.',
          fix: 'Call app.use(convexVue, { url }) before mounting the app.',
        },
        VUE_CONVEX_R0003: {
          why: 'The Convex realtime client is not connected.',
          fix: 'Pass `url` to app.use(convexVue, { url }), or connect with useConvexController().connect({ url }) first.',
        },
        VUE_CONVEX_R0004: {
          why: 'The Convex HTTP client is not connected.',
          fix: 'Pass `url` to app.use(convexVue, { url }), or connect with useConvexController().connect({ url }) first.',
        },
        VUE_CONVEX_R0005: {
          why: 'reconfigure() needs a Convex URL, and none is configured.',
          fix: 'Call connect({ url }) first, or pass `url` to reconfigure().',
        },
        VUE_CONVEX_R0006: {
          why: 'Storage feature is not configured.',
          fix: 'Install convexVueStorage from vue-convex/storage: app.use(convexVueStorage, { generateUploadUrl, getUrl, remove }).',
        },
        VUE_CONVEX_R0007: {
          why: 'The upload response did not include a storageId.',
          fix: 'Make the `generateUploadUrl` mutation return `await ctx.storage.generateUploadUrl()`, so the file is posted to Convex storage.',
        },
        VUE_CONVEX_R0008: {
          why: 'Uploads are only available on the client.',
          fix: 'Call upload() from an event handler or onMounted(), not during server rendering.',
        },
      },
    })

/** Codes that are only reported. They log in production too, like the console calls they replace, with the code and docs link only. */
// eslint-disable-next-line node/prefer-global/process -- the consumer's bundler replaces process.env.NODE_ENV
export const warnings = process.env.NODE_ENV === 'production'
  ? /* @__PURE__ */ defineProdDiagnostics({ docsBase, reporters: [createConsoleReporter({ method: 'error' })] })
  : /* @__PURE__ */ defineDiagnostics({
      docsBase,
      reporters: [createConsoleReporter({ method: 'error' })],
      codes: {
        VUE_CONVEX_R0009: {
          why: 'serverAuth.getToken() failed, so SSR queries run anonymously.',
          fix: 'Check the token getter passed as `serverAuth.getToken`: it must resolve to a JWT or null, not reject.',
        },
      },
    })
