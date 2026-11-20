import { createConsoleReporter, defineDiagnostics, defineProdDiagnostics } from 'nostics'

const docsBase = (code: string): string => `https://nuxt-convex.onmax.me/errors/${code.toLowerCase().replaceAll('_', '-')}`

/**
 * Codes the runtime throws or hands to `onError`. No reporters: the caller throws, so a reporter would print it twice.
 * Production builds keep the code and the docs link but drop the text.
 */
// eslint-disable-next-line node/prefer-global/process -- the app's bundler replaces process.env.NODE_ENV
export const runtimeErrors = process.env.NODE_ENV === 'production'
  ? /* @__PURE__ */ defineProdDiagnostics({ docsBase })
  : /* @__PURE__ */ defineDiagnostics({
      docsBase,
      codes: {
        NUXT_CONVEX_R0005: {
          why: 'Convex URL is not configured, so server routes cannot call Convex.',
          fix: 'Set CONVEX_URL at build time or NUXT_PUBLIC_CONVEX_URL at run time.',
        },
        NUXT_CONVEX_R0006: {
          why: 'The Better Auth proxy has no Convex site URL to forward auth requests to.',
          fix: 'Set CONVEX_SITE_URL (or convex.siteUrl), or NUXT_PUBLIC_CONVEX_SITE_URL at run time.',
        },
        NUXT_CONVEX_R0007: {
          why: (params: { origin: string }) => `Could not reach ${params.origin}.`,
          fix: (params: { origin: string, probePath: string }) => `Open ${params.origin}${params.probePath}. If it doesn't answer, fix the site URL or start \`npx convex dev\`.`,
        },
        NUXT_CONVEX_R0008: {
          why: 'The Convex realtime client is not connected, so R2 uploads cannot start.',
          fix: 'Call upload() from the browser once the app has a Convex URL.',
        },
        NUXT_CONVEX_R0009: {
          why: 'R2 uploads are only available on the client.',
          fix: 'Call upload() from an event handler or onMounted(), not during server rendering.',
        },
      },
    })

const warnReporter = /* @__PURE__ */ createConsoleReporter({ method: 'warn' })

/** Codes the runtime only reports. They log in production too, like the console calls they replace, with the code and docs link only. */
// eslint-disable-next-line node/prefer-global/process -- the app's bundler replaces process.env.NODE_ENV
export const runtimeWarnings = process.env.NODE_ENV === 'production'
  ? /* @__PURE__ */ defineProdDiagnostics({ docsBase, reporters: [warnReporter] })
  : /* @__PURE__ */ defineDiagnostics({
      docsBase,
      reporters: [warnReporter],
      codes: {
        NUXT_CONVEX_R0001: {
          why: 'No Convex URL configured, so the runtime starts disconnected.',
          fix: 'Set CONVEX_URL or NUXT_PUBLIC_CONVEX_URL.',
        },
        NUXT_CONVEX_R0002: {
          why: 'Resolving the Convex token failed, so the page renders signed out.',
          fix: 'Check the `convex:token` hook and the auth provider: the token resolver must return a JWT or null, not throw.',
        },
        NUXT_CONVEX_R0003: {
          why: 'Failed to load storage refs from the generated Convex API.',
          fix: 'Run `npx convex dev` so convex/_generated includes `_hub/storage`.',
        },
      },
    })
