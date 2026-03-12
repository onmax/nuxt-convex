import { describe, expect, it } from 'vitest'
import { getPlaygroundSiteUrl, getPlaygroundWorkerName, hasGitHubCredentials, isGitHubAuthEnabled, parseBooleanFlag } from '../src/internal/playground-env'

describe('playground env helpers', () => {
  it('uses stable defaults when preview env is unset', () => {
    expect(getPlaygroundWorkerName({})).toBe('demo-nuxt-convex')
    expect(getPlaygroundSiteUrl({})).toBe('https://demo-nuxt-convex.onmax.me')
    expect(isGitHubAuthEnabled({})).toBe(false)
  })

  it('prefers preview overrides for worker and site url', () => {
    expect(getPlaygroundWorkerName({ NUXT_PLAYGROUND_WORKER_NAME: 'nuxt-convex-playground-pr-23' })).toBe('nuxt-convex-playground-pr-23')
    expect(getPlaygroundSiteUrl({ NUXT_PUBLIC_SITE_URL: 'https://nuxt-convex-playground-pr-23.example.workers.dev' })).toBe('https://nuxt-convex-playground-pr-23.example.workers.dev')
    expect(getPlaygroundSiteUrl({ SITE_URL: 'https://nuxt-convex-playground-pr-23.example.workers.dev' })).toBe('https://nuxt-convex-playground-pr-23.example.workers.dev')
  })

  it('enables GitHub auth only when fully configured', () => {
    const env = {
      GITHUB_CLIENT_ID: 'github-client',
      GITHUB_CLIENT_SECRET: 'github-secret',
      NUXT_GITHUB_CLIENT_ID: 'nuxt-client',
      NUXT_GITHUB_SECRET: 'nuxt-secret',
    }

    expect(hasGitHubCredentials(env)).toBe(true)
    expect(isGitHubAuthEnabled(env)).toBe(true)
    expect(isGitHubAuthEnabled({ ...env, NUXT_PUBLIC_ENABLE_GITHUB_AUTH: 'false' })).toBe(false)
    expect(isGitHubAuthEnabled({ ...env, PLAYGROUND_ENABLE_GITHUB_AUTH: '0' })).toBe(false)
  })

  it('parses runtime boolean overrides consistently', () => {
    expect(parseBooleanFlag(true, false)).toBe(true)
    expect(parseBooleanFlag(false, true)).toBe(false)
    expect(parseBooleanFlag('false', true)).toBe(false)
    expect(parseBooleanFlag('off', true)).toBe(false)
    expect(parseBooleanFlag(undefined, true)).toBe(true)
  })
})
