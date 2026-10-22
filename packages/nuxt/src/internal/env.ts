import { existsSync, readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { join } from 'pathe'

type Env = Record<string, string | undefined>

export interface ConvexEnv {
  url?: string
  siteUrl?: string
  /** `CONVEX_DEPLOYMENT`, e.g. `dev:happy-otter-123` */
  deployment?: string
}

function pick(env: Env, ...keys: string[]): string | undefined {
  for (const key of keys) {
    if (env[key])
      return env[key]
  }
}

export function readConvexEnv(env: Env): ConvexEnv {
  return {
    url: pick(env, 'CONVEX_URL', 'NUXT_PUBLIC_CONVEX_URL', 'VITE_CONVEX_URL'),
    siteUrl: pick(env, 'CONVEX_SITE_URL', 'NUXT_PUBLIC_CONVEX_SITE_URL', 'VITE_CONVEX_SITE_URL'),
    deployment: pick(env, 'CONVEX_DEPLOYMENT'),
  }
}

/** `npx convex dev` writes `.env.local`, which Nuxt doesn't load by itself */
export function readDotenvLocal(rootDir: string): Env {
  const path = join(rootDir, '.env.local')
  if (!existsSync(path))
    return {}
  return parseEnv(readFileSync(path, 'utf8'))
}

/** `process.env` wins over `.env.local` */
export function resolveConvexEnv(env: Env, dotenvLocal: Env = {}): ConvexEnv {
  const fromEnv = readConvexEnv(env)
  const fromFile = readConvexEnv(dotenvLocal)
  return {
    url: fromEnv.url || fromFile.url,
    siteUrl: fromEnv.siteUrl || fromFile.siteUrl,
    deployment: fromEnv.deployment || fromFile.deployment,
  }
}
