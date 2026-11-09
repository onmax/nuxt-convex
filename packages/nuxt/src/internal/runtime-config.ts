import type { Nuxt } from 'nuxt/schema'
import type { ConvexClientConfig } from '../types/config'
import { pathToFileURL } from 'node:url'
import { directoryToURL, importModule, resolveModule } from '@nuxt/kit'
import { toStandardJsonSchema } from '@valibot/to-json-schema'
import * as v from 'valibot'

/** One schema per `clientOptions` key, so the schema can't drift from the option type */
type ClientOptionSchemas = { [Key in keyof ConvexClientConfig]-?: v.GenericSchema<ConvexClientConfig[Key]> }

/**
 * `runtimeConfig.public.convex`. Nuxt 5 checks only types, required keys and picklists when the
 * server starts, so the schema declares nothing else. Defaults are the values the module writes.
 */
export const convexPublicRuntimeConfigSchema = v.object({
  url: v.string(),
  siteUrl: v.string(),
  ssr: v.boolean(),
  storage: v.boolean(),
  r2: v.boolean(),
  clientOptions: v.object({
    verbose: v.optional(v.boolean()),
    unsavedChangesWarning: v.optional(v.boolean()),
    skipConvexDeploymentUrlCheck: v.optional(v.boolean()),
    authRefreshTokenLeewaySeconds: v.optional(v.number()),
    expectAuth: v.optional(v.boolean()),
    reportDebugInfoToConvex: v.optional(v.boolean()),
    initialAuthTokenReuse: v.optional(v.boolean()),
    logger: v.optional(v.boolean()),
  } satisfies ClientOptionSchemas),
  auth: v.object({
    provider: v.picklist(['better-auth', 'none']),
    basePath: v.string(),
    proxy: v.boolean(),
  }),
})

/** Shape of `runtimeConfig.public.convex` */
export type ConvexPublicRuntimeConfig = v.InferOutput<typeof convexPublicRuntimeConfigSchema>

/** Nuxt 5 keeps the runtime config schemas it validates in `_runtimeConfigSchemas` */
export function supportsRuntimeConfigSchemas(nuxt: Nuxt): boolean {
  return Array.isArray((nuxt.options as { _runtimeConfigSchemas?: unknown })._runtimeConfigSchemas)
}

/**
 * Hand `runtimeConfig.public.convex` to Nuxt's schema validation. Call it after writing the values.
 *
 * Outside development a missing URL is left unset, so the server refuses to start until
 * `NUXT_PUBLIC_CONVEX_URL` provides it. `nuxt dev` keeps the empty default, because
 * `npx convex dev` often writes the URL after Nuxt starts.
 */
export async function registerRuntimeConfigSchema(nuxt: Nuxt): Promise<void> {
  const convex = nuxt.options.runtimeConfig.public.convex as Partial<ConvexPublicRuntimeConfig>
  if (!nuxt.options.dev && !convex.url)
    delete convex.url

  // This module's own Kit can predate schemas and would merge the schema in as a value, so use the Kit Nuxt runs with
  const nuxtEntry = resolveModule('nuxt', { url: [nuxt.options.rootDir, ...nuxt.options.modulesDir].map(dir => directoryToURL(dir)) })
  const kit = await importModule<typeof import('@nuxt/kit')>('@nuxt/kit', { url: pathToFileURL(nuxtEntry) })
  await kit.updateRuntimeConfig({ public: { convex: toStandardJsonSchema(convexPublicRuntimeConfigSchema) } })
}
