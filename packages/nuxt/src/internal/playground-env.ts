import process from 'node:process'

type EnvSource = Record<string, string | undefined>
type BooleanSource = boolean | string | undefined

const DEFAULT_DEV_SITE_URL = 'http://localhost:3000'
const DEFAULT_SITE_URL = 'https://demo-nuxt-convex.onmax.me'
const DEFAULT_WORKER_NAME = 'nuxt-convex-playground'
const DISABLED_VALUES = new Set(['0', 'false', 'no', 'off'])

function getEnvValue(env: EnvSource, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = env[key]
    if (value)
      return value
  }
}

export function parseBooleanFlag(value: BooleanSource, fallback: boolean): boolean {
  if (typeof value === 'boolean')
    return value

  if (value == null || value === '')
    return fallback

  return !DISABLED_VALUES.has(value.toLowerCase())
}

export function hasGitHubCredentials(env: EnvSource = process.env): boolean {
  return Boolean(
    env.NUXT_GITHUB_CLIENT_ID
    && env.NUXT_GITHUB_SECRET
    && env.GITHUB_CLIENT_ID
    && env.GITHUB_CLIENT_SECRET,
  )
}

export function getPlaygroundSiteUrl(env: EnvSource = process.env): string {
  return getEnvValue(env, 'NUXT_PUBLIC_SITE_URL', 'SITE_URL')
    || (env.NODE_ENV === 'production' ? DEFAULT_SITE_URL : DEFAULT_DEV_SITE_URL)
}

export function getPlaygroundWorkerName(env: EnvSource = process.env): string {
  return env.NUXT_PLAYGROUND_WORKER_NAME || DEFAULT_WORKER_NAME
}

export function isGitHubAuthEnabled(env: EnvSource = process.env): boolean {
  return parseBooleanFlag(
    getEnvValue(env, 'NUXT_PUBLIC_ENABLE_GITHUB_AUTH', 'PLAYGROUND_ENABLE_GITHUB_AUTH'),
    hasGitHubCredentials(env),
  )
}
