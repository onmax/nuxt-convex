import { describe, expect, it } from 'vitest'
import { resolveConvexOptions } from '../../src/internal/options'

describe('resolveConvexOptions', () => {
  it('prefers the url option, then process.env, then .env.local', () => {
    const dotenvLocal = { CONVEX_URL: 'http://127.0.0.1:3210', CONVEX_DEPLOYMENT: 'anonymous:demo' }

    expect(resolveConvexOptions({ url: 'https://option.convex.cloud' }, { env: { CONVEX_URL: 'https://env.convex.cloud' }, dotenvLocal }).runtime.url).toBe('https://option.convex.cloud')
    expect(resolveConvexOptions({}, { env: { CONVEX_URL: 'https://env.convex.cloud' }, dotenvLocal }).runtime.url).toBe('https://env.convex.cloud')
    expect(resolveConvexOptions({}, { env: {}, dotenvLocal }).runtime.url).toBe('http://127.0.0.1:3210')
    expect(resolveConvexOptions({}, { env: {}, dotenvLocal }).deployment).toBe('anonymous:demo')
    expect(resolveConvexOptions({}, { env: {} }).runtime.url).toBe('')
  })

  it('accepts the env names written by convex and vite setups', () => {
    expect(resolveConvexOptions({}, { env: { NUXT_PUBLIC_CONVEX_URL: 'https://a.convex.cloud' } }).runtime.url).toBe('https://a.convex.cloud')
    expect(resolveConvexOptions({}, { env: { VITE_CONVEX_URL: 'https://b.convex.cloud' } }).runtime.url).toBe('https://b.convex.cloud')
    expect(resolveConvexOptions({}, { env: { CONVEX_SITE_URL: 'https://b.convex.site' } }).runtime.siteUrl).toBe('https://b.convex.site')
    expect(resolveConvexOptions({ siteUrl: 'https://c.example' }, { env: { CONVEX_SITE_URL: 'https://b.convex.site' } }).runtime.siteUrl).toBe('https://c.example')
  })

  it('treats `server` as a deprecated alias of `ssr`', () => {
    expect(resolveConvexOptions({}, { env: {} }).runtime.ssr).toBe(true)
    expect(resolveConvexOptions({ server: false }, { env: {} }).runtime.ssr).toBe(false)
    expect(resolveConvexOptions({ server: false, ssr: true }, { env: {} }).runtime.ssr).toBe(true)
  })

  it('passes client options through', () => {
    expect(resolveConvexOptions({ clientOptions: { verbose: true, logger: false } }, { env: {} }).runtime.clientOptions).toEqual({ verbose: true, logger: false })
  })

  it('enables the Better Auth provider and proxy only when they apply', () => {
    const auth = (options: Parameters<typeof resolveConvexOptions>[0], betterAuth?: { clientOnly: boolean }) =>
      resolveConvexOptions(options, { env: {}, betterAuth }).runtime.auth

    expect(auth({})).toEqual({ provider: 'none', basePath: '/api/auth', proxy: false })
    expect(auth({}, { clientOnly: true })).toEqual({ provider: 'better-auth', basePath: '/api/auth', proxy: true })
    expect(auth({}, { clientOnly: false })).toEqual({ provider: 'better-auth', basePath: '/api/auth', proxy: false })
    expect(auth({ auth: { provider: 'better-auth' } })).toEqual({ provider: 'better-auth', basePath: '/api/auth', proxy: true })
    expect(auth({ auth: { proxy: false } }, { clientOnly: true }).proxy).toBe(false)
    expect(auth({ auth: false }, { clientOnly: true })).toEqual({ provider: 'none', basePath: '/api/auth', proxy: false })
    expect(auth({ auth: { provider: false, proxy: true } }, { clientOnly: true }).proxy).toBe(false)
  })
})
