import type { ConvexConfig, ConvexPublicRuntimeConfig, ResolvedConvexAuthConfig } from '../types/config'
import { resolveConvexEnv } from './env'

type Env = Record<string, string | undefined>

export interface ResolveConvexOptionsContext {
  env: Env
  /** `.env.local` values, only read in development */
  dotenvLocal?: Env
  /** Set when `@nuxtjs/better-auth` is installed */
  betterAuth?: { clientOnly: boolean }
}

export interface ResolvedConvexOptions {
  dir: string
  devtools: boolean
  deployment?: string
  runtime: ConvexPublicRuntimeConfig
}

export function resolveConvexOptions(options: ConvexConfig, ctx: ResolveConvexOptionsContext): ResolvedConvexOptions {
  const env = resolveConvexEnv(ctx.env, ctx.dotenvLocal)

  return {
    dir: options.dir || 'convex',
    devtools: options.devtools !== false,
    deployment: env.deployment,
    runtime: {
      url: options.url || env.url || '',
      // Derived from `url` at runtime when empty, so a runtime `NUXT_PUBLIC_CONVEX_URL` carries over
      siteUrl: options.siteUrl || env.siteUrl || '',
      ssr: options.ssr ?? options.server ?? true,
      storage: Boolean(options.storage),
      r2: Boolean(options.r2),
      clientOptions: { ...options.clientOptions },
      auth: resolveAuth(options.auth, ctx.betterAuth),
    },
  }
}

function resolveAuth(input: ConvexConfig['auth'], betterAuth: ResolveConvexOptionsContext['betterAuth']): ResolvedConvexAuthConfig {
  const options = input && input !== true ? input : {}
  const basePath = options.basePath || '/api/auth'
  const provider = input === false || options.provider === false
    ? 'none'
    : options.provider ?? (betterAuth ? 'better-auth' : 'none')

  // `@nuxtjs/better-auth` with a server serves `/api/auth/**` itself
  const proxy = provider === 'better-auth' && (options.proxy ?? (!betterAuth || betterAuth.clientOnly))
  return { provider, basePath, proxy }
}
