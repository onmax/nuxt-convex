import { ConvexError } from 'convex/values'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getConvexToken, requireConvexAuth, serverConvexMutation, serverConvexQuery, toConvexH3Error, useConvexServer } from '../../src/runtime/server/utils/convex'

const mocks = vi.hoisted(() => ({
  hooks: [] as Array<(event: unknown, ctx: { token?: string | null, headers: Headers }) => unknown>,
  serverFetch: vi.fn(),
  runtimeConfig: { public: { convex: {} as Record<string, any> } },
  clients: [] as Array<{ url: string, options: unknown, setAuth: ReturnType<typeof vi.fn>, query: ReturnType<typeof vi.fn>, mutation: ReturnType<typeof vi.fn> }>,
}))

vi.mock('nuxt/server', () => ({
  useServerHooks: () => ({
    callHook: async (_name: string, ...args: [any, any]) => {
      for (const hook of mocks.hooks)
        await hook(...args)
    },
  }),
  getRequestHeaders: (event: { req: Request }) => Object.fromEntries(event.req.headers),
  serverFetch: mocks.serverFetch,
  useRuntimeConfig: () => mocks.runtimeConfig,
  createError: (input: Record<string, unknown>) => Object.assign(new Error(String(input.message)), input, { __nuxt_error: true }),
  isNuxtError: (error: any) => error?.__nuxt_error === true,
}))

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    setAuth = vi.fn()
    query = vi.fn(async () => 'query-result')
    mutation = vi.fn(async () => {
      throw new ConvexError({ status: 409, message: 'Taken' })
    })

    constructor(public url: string, public options: unknown) {
      mocks.clients.push(this as any)
    }
  },
}))

function createEvent(headers: Record<string, string> = {}) {
  return { req: new Request('http://app.test/', { headers }), res: { headers: new Headers() }, context: {} } as any
}

describe('server token resolver', () => {
  beforeEach(() => {
    mocks.hooks.length = 0
    mocks.clients.length = 0
    mocks.serverFetch.mockReset()
    mocks.runtimeConfig.public.convex = { url: 'https://test.convex.cloud', auth: { provider: 'better-auth', basePath: '/api/auth' }, clientOptions: {} }
  })

  it('resolves the token once per request and exposes it on the event context', async () => {
    const hook = vi.fn((_event, ctx) => {
      ctx.token = ctx.headers.get('authorization')?.slice(7)
    })
    mocks.hooks.push(hook)
    const event = createEvent({ authorization: 'Bearer jwt-1' })

    expect(await getConvexToken(event)).toBe('jwt-1')
    expect(await event.context.$convexToken()).toBe('jwt-1')
    expect(hook).toHaveBeenCalledTimes(1)
    expect(event.res.headers.get('vary')).toBe('Cookie')
    expect(event.res.headers.get('cache-control')).toBe('private, no-cache')
  })

  it('lets a hook force anonymous requests', async () => {
    mocks.hooks.push((_event, ctx) => {
      ctx.token = null
    })

    expect(await getConvexToken(createEvent({ cookie: 'better-auth.session_token=a' }))).toBeNull()
    expect(mocks.serverFetch).not.toHaveBeenCalled()
  })

  it('exchanges the Better Auth session cookie for a token', async () => {
    mocks.serverFetch.mockResolvedValue(Response.json({ token: 'jwt-2' }))
    const event = createEvent({ cookie: 'theme=dark; __Secure-better-auth.session_token=abc', vary: 'Accept' })
    event.res.headers.set('vary', 'Accept')

    expect(await getConvexToken(event)).toBe('jwt-2')
    expect(mocks.serverFetch).toHaveBeenCalledWith(event, '/api/auth/convex/token', { forwardHeaders: ['cookie'] })
    expect(event.res.headers.get('vary')).toBe('Accept, Cookie')
  })

  it('stays anonymous without a session cookie, a session, or a reachable token endpoint', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(await getConvexToken(createEvent({ cookie: 'theme=dark' }))).toBeNull()
    expect(mocks.serverFetch).not.toHaveBeenCalled()

    mocks.serverFetch.mockResolvedValueOnce(new Response(null, { status: 401 }))
    expect(await getConvexToken(createEvent({ cookie: 'better-auth.session_token=a' }))).toBeNull()
    expect(warn).not.toHaveBeenCalled()

    mocks.serverFetch.mockRejectedValueOnce(new TypeError('fetch failed'))
    const event = createEvent({ cookie: 'better-auth.session_token=a' })
    expect(await getConvexToken(event)).toBeNull()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(event.res.headers.get('vary')).toBeNull()
    warn.mockRestore()
  })

  it('has no built-in provider when auth is disabled', async () => {
    mocks.runtimeConfig.public.convex.auth = { provider: 'none', basePath: '/api/auth' }
    expect(await getConvexToken(createEvent({ cookie: 'better-auth.session_token=a' }))).toBeNull()
    expect(mocks.serverFetch).not.toHaveBeenCalled()
  })

  it('works with h3 v1 events, which expose a node response', async () => {
    mocks.hooks.push((_event, ctx) => {
      ctx.token = 'jwt-3'
    })
    const setHeader = vi.fn()
    const event = { req: new Request('http://app.test/'), node: { res: { getHeader: () => undefined, setHeader, headersSent: false } }, context: {} } as any

    expect(await getConvexToken(event)).toBe('jwt-3')
    expect(setHeader).toHaveBeenCalledWith('vary', 'Cookie')
  })

  it('requireConvexAuth throws a 401 for anonymous requests', async () => {
    await expect(requireConvexAuth(createEvent())).rejects.toMatchObject({ status: 401 })
  })
})

describe('server helpers', () => {
  beforeEach(() => {
    mocks.hooks.length = 0
    mocks.clients.length = 0
    mocks.runtimeConfig.public.convex = { url: 'https://test.convex.cloud', auth: { provider: 'none', basePath: '/api/auth' }, clientOptions: { skipConvexDeploymentUrlCheck: true } }
  })

  it('shares one authenticated client per request', async () => {
    mocks.hooks.push((_event, ctx) => {
      ctx.token = 'jwt-4'
    })
    const event = createEvent()
    const ref = { _name: 'tasks:list' } as any

    expect(await serverConvexQuery(event, ref, { id: 1 })).toBe('query-result')
    expect(await useConvexServer(event).query(ref)).toBe('query-result')
    expect(useConvexServer(event)).toBe(useConvexServer(event))
    expect(mocks.clients).toHaveLength(1)
    expect(mocks.clients[0]).toMatchObject({ url: 'https://test.convex.cloud', options: { skipConvexDeploymentUrlCheck: true } })
    expect(mocks.clients[0]!.setAuth).toHaveBeenCalledWith('jwt-4')
    expect(mocks.clients[0]!.query).toHaveBeenCalledWith(ref, { id: 1 })
  })

  it('stays anonymous without a token', async () => {
    await serverConvexQuery(createEvent(), { _name: 'tasks:list' } as any)
    expect(mocks.clients[0]!.setAuth).not.toHaveBeenCalled()
  })

  it('throws ConvexErrors as H3 errors', async () => {
    await expect(serverConvexMutation(createEvent(), { _name: 'tasks:add' } as any, {})).rejects.toMatchObject({
      status: 409,
      message: 'Taken',
      data: { status: 409, message: 'Taken' },
    })
  })

  it('fails clearly without a Convex URL', async () => {
    mocks.runtimeConfig.public.convex.url = ''
    await expect(serverConvexQuery(createEvent(), { _name: 'tasks:list' } as any)).rejects.toMatchObject({ status: 500, message: expect.stringContaining('Convex URL') })
  })
})

describe('toConvexH3Error', () => {
  it('maps application errors to 400 unless their data carries a status', () => {
    expect(toConvexH3Error(new ConvexError('Nope'))).toMatchObject({ status: 400, message: 'Nope', data: 'Nope' })
    expect(toConvexH3Error(new ConvexError({ code: 'X' }))).toMatchObject({ status: 400, message: 'Convex function failed', data: { code: 'X' } })
    expect(toConvexH3Error(new ConvexError({ status: 200 }))).toMatchObject({ status: 400 })
  })

  it('hides other failures behind a 500 and keeps the cause', () => {
    const cause = new Error('[Request ID: 1] Server Error')
    expect(toConvexH3Error(cause)).toMatchObject({ status: 500, message: 'Convex request failed', cause })
  })
})
