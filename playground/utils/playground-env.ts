import process from 'node:process'

type EnvSource = Record<string, string | undefined>

const DEFAULT_SITE_URL = 'https://demo-nuxt-convex.onmax.me'
const DEFAULT_WORKER_NAME = 'demo-nuxt-convex'
const DISABLED_VALUES = new Set(['0', 'false', 'no', 'off'])

function getEnvValue(env: EnvSource, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = env[key]
    if (value)
      return value
  }
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
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
  return getEnvValue(env, 'NUXT_PUBLIC_SITE_URL', 'SITE_URL') || DEFAULT_SITE_URL
}

export function getPlaygroundWorkerName(env: EnvSource = process.env): string {
  return env.NUXT_PLAYGROUND_WORKER_NAME || DEFAULT_WORKER_NAME
}

export function isGitHubAuthEnabled(env: EnvSource = process.env): boolean {
  return parseBoolean(
    getEnvValue(env, 'NUXT_PUBLIC_ENABLE_GITHUB_AUTH', 'PLAYGROUND_ENABLE_GITHUB_AUTH'),
    hasGitHubCredentials(env),
  )
}
