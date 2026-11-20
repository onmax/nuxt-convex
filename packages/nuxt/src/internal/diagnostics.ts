import { consola } from 'consola'
import { defineDiagnostics, formatDiagnostic } from 'nostics'

const docsBase = (code: string): string => `https://nuxt-convex.onmax.me/errors/${code.toLowerCase().replaceAll('_', '-')}`

const log = consola.withTag('nuxt:convex')

/** Codes the module throws while Nuxt loads. No reporters: Nuxt prints the thrown error. */
export const moduleErrors = defineDiagnostics({
  docsBase,
  codes: {
    NUXT_CONVEX_C0001: {
      why: 'The `convex` Better Auth database provider was removed: it needed public, unauthenticated CRUD functions over your auth tables.',
      fix: 'Run Better Auth inside Convex with `@convex-dev/better-auth` and set `auth.clientOnly: true`; nuxt-convex proxies `/api/auth/**` to it.',
    },
  },
})

/** Codes the module warns about while Nuxt loads, printed through consola like the rest of the module's logs. */
export const moduleWarnings = defineDiagnostics({
  docsBase,
  reporters: [diagnostic => log.warn(formatDiagnostic(diagnostic))],
  codes: {
    NUXT_CONVEX_C0002: {
      why: 'Convex URL not configured, so the app starts disconnected.',
      fix: 'Run `npx convex dev`, which writes CONVEX_URL to .env.local, or set CONVEX_URL.',
    },
    NUXT_CONVEX_D0001: {
      why: '`convex.server` is deprecated.',
      fix: 'Rename it to `convex.ssr` in nuxt.config.ts.',
    },
    NUXT_CONVEX_B0001: {
      why: (p: { generatedDir: string }) => `Missing ${p.generatedDir}, so \`#convex/api\` has no types.`,
      fix: 'Run `npx convex dev` to generate them.',
    },
    NUXT_CONVEX_B0002: {
      why: (p: { storagePath: string }) => `${p.storagePath} lets anyone upload and delete files.`,
      fix: (p: { storagePath: string }) => `Add auth and ownership checks to ${p.storagePath} in place. Only delete and regenerate an unmodified scaffold.`,
    },
    NUXT_CONVEX_B0003: {
      why: (p: { readDir: string, storagePath: string }) => `Reading Convex files from ${p.readDir} and scaffolding ${p.storagePath} instead, because the resolved layer is not writable.`,
      fix: 'Set `convex.dir` to a writable project path to override this.',
    },
  },
})
