import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  runtimeConfig: { public: { convex: {} as Record<string, any> } },
}))

vi.mock('nuxt/server', () => ({
  defineEventHandler: (handler: unknown) => handler,
  createError: (input: Record<string, unknown>) => Object.assign(new Error(String(input.message)), input),
  getRequestIP: () => undefined,
  useRuntimeConfig: () => mocks.runtimeConfig,
}))

const { default: authProxy } = await import('../../src/runtime/server/routes/auth-proxy')

function createEvent(path = '/api/auth/get-session') {
  const url = new URL(path, 'http://app.test')
  return { req: new Request(url), url } as any
}

describe('auth proxy', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it('answers 500 with NUXT_CONVEX_R0006 when there is no site URL', async () => {
    mocks.runtimeConfig.public.convex = { url: 'https://convex.example.com' }

    await expect(authProxy(createEvent())).rejects.toMatchObject({
      status: 500,
      message: expect.stringContaining('[NUXT_CONVEX_R0006]'),
      cause: expect.objectContaining({ name: 'NUXT_CONVEX_R0006', fix: expect.stringContaining('CONVEX_SITE_URL') }),
    })
  })

  it('answers 502 with NUXT_CONVEX_R0007 when the site URL is unreachable', async () => {
    const failure = new TypeError('fetch failed')
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw failure
    }))
    mocks.runtimeConfig.public.convex = { siteUrl: 'https://down.convex.site', auth: { basePath: '/auth/' } }

    await expect(authProxy(createEvent('/auth/get-session'))).rejects.toMatchObject({
      status: 502,
      statusText: 'Bad Gateway',
      message: '[NUXT_CONVEX_R0007] Could not reach https://down.convex.site.',
      cause: expect.objectContaining({ name: 'NUXT_CONVEX_R0007', cause: failure, fix: expect.stringContaining('https://down.convex.site/auth/ok') }),
    })
  })

  it('logs only the upstream origin on a production 502', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubEnv('NODE_ENV', 'production')
    vi.resetModules()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    mocks.runtimeConfig.public.convex = { siteUrl: 'https://user:pass@down.convex.site/private?secret=value' }

    try {
      const { default: productionProxy } = await import('../../src/runtime/server/routes/auth-proxy')
      await expect(productionProxy(createEvent('/api/auth/get-session?token=value'))).rejects.toMatchObject({
        status: 502,
        message: expect.not.stringContaining('down.convex.site'),
        cause: expect.objectContaining({ name: 'NUXT_CONVEX_R0007' }),
      })
      expect(warn.mock.calls).toEqual([['[NUXT_CONVEX_R0007] Upstream: https://down.convex.site']])
    }
    finally {
      warn.mockRestore()
      vi.unstubAllEnvs()
      vi.resetModules()
    }
  })
})
