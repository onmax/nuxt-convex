import { createConsoleReporter, defineDiagnostics } from 'nostics'

// eslint-disable-next-line node/prefer-global/process -- Nitro replaces process.env.NODE_ENV at build time
const production = process.env.NODE_ENV === 'production'

export const authWarnings = defineDiagnostics({
  docsBase: (code: string) => `https://nuxt-convex.onmax.me/errors/${code.toLowerCase().replaceAll('_', '-')}`,
  reporters: [createConsoleReporter({ method: 'warn' })],
  codes: {
    NUXT_CONVEX_R0004: {
      why: (params: { status: number, tokenPath: string }) => production
        ? `HTTP ${params.status} ${params.tokenPath}`
        : `Better Auth token request failed with ${params.status}, so the page renders anonymously.`,
      ...(!production && {
        fix: (params: { tokenPath: string }) => `Request ${params.tokenPath} while signed in: it should return { "token": "..." }. Check the Better Auth setup in your Convex deployment.`,
      }),
    },
  },
})
