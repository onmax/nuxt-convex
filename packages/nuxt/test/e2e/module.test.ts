import type { AddressInfo } from 'node:net'
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch } from 'ofetch'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { setupSubprocessE2E } from '../helpers/subprocess-e2e'

const rootDir = fileURLToPath(new URL('../fixtures/full', import.meta.url))

interface UpstreamRequest {
  method?: string
  url?: string
  headers: Record<string, string | string[] | undefined>
  body: string
}

// Stands in for the Convex site URL, where @convex-dev/better-auth serves `/api/auth/**`
const upstream: UpstreamRequest[] = []
const upstreamServer = createServer((req, res) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', () => {
    upstream.push({ method: req.method, url: req.url, headers: req.headers, body })
    if (req.url === '/api/auth/convex/token') {
      const session = /session_token=([^;]+)/.exec(req.headers.cookie || '')?.[1]
      res.writeHead(session ? 200 : 401, { 'content-type': 'application/json' })
      res.end(JSON.stringify(session ? { token: `jwt-${session}` } : { message: 'Unauthorized' }))
      return
    }
    res.writeHead(200, { 'content-type': 'application/json', 'set-cookie': ['a=1; Path=/', 'b=2; Path=/'] })
    res.end(JSON.stringify({ ok: true }))
  })
})

beforeAll(async () => {
  await new Promise<void>(resolve => upstreamServer.listen(0, '127.0.0.1', resolve))
})

afterAll(() => {
  upstreamServer.close()
})

describe('nuxt-convex', () => {
  const fixture = setupSubprocessE2E({
    rootDir,
    env: () => ({ NUXT_PUBLIC_CONVEX_SITE_URL: `http://127.0.0.1:${(upstreamServer.address() as AddressInfo).port}` }),
  })

  it('exposes the resolved public runtime config', async () => {
    const res = await fixture.fetch<{ convex: Record<string, unknown> }>('/api/config')
    expect(res.convex).toEqual({
      url: 'https://test.convex.cloud',
      siteUrl: expect.stringMatching(/^http:\/\/127\.0\.0\.1:\d+$/),
      ssr: true,
      storage: true,
      r2: false,
      clientOptions: { verbose: true },
      auth: { provider: 'better-auth', basePath: '/api/auth', proxy: true },
    })
  })

  it('renders config in SSR and exposes the token getter to the Vue app', async () => {
    const html = await fixture.fetch<string>('/', { responseType: 'text' })
    expect(html).toContain('https://test.convex.cloud')
    expect(html).toContain('function,function,function,function')
    expect(html).toContain('<span data-testid="token-getter">function</span>')
  })

  it('resolves the token from the convex:token hook once per request', async () => {
    const res = await $fetch.raw<{ token: string, same: boolean }>(fixture.url('/api/token'), { headers: { 'x-test-token': 'hook-jwt' } })
    expect(res._data).toEqual({ token: 'hook-jwt', same: true })
    expect(res.headers.get('vary')).toContain('Cookie')
    expect(res.headers.get('cache-control')).toBe('private, no-cache')
  })

  it('lets the hook force an anonymous request', async () => {
    upstream.length = 0
    const res = await fixture.fetch('/api/token', { headers: { 'x-test-token': 'anonymous', 'cookie': 'better-auth.session_token=abc' } })
    expect(res).toEqual({ token: null, same: true })
    expect(upstream).toHaveLength(0)
  })

  it('exchanges the Better Auth session cookie for a Convex token', async () => {
    upstream.length = 0
    const res = await fixture.fetch('/api/token', { headers: { cookie: 'better-auth.session_token=abc' } })
    expect(res).toEqual({ token: 'jwt-abc', same: true })
    expect(upstream.map(request => request.url)).toEqual(['/api/auth/convex/token'])
  })

  it('skips the token request without a session cookie', async () => {
    upstream.length = 0
    const res = await $fetch.raw(fixture.url('/api/token'))
    expect(res._data).toEqual({ token: null, same: true })
    expect(res.headers.get('vary')).toBeNull()
    expect(upstream).toHaveLength(0)
  })

  it('requireConvexAuth throws a 401 for anonymous requests', async () => {
    const res = await $fetch.raw(fixture.url('/api/protected'), { ignoreResponseError: true })
    expect(res.status).toBe(401)
  })

  it('maps ConvexError data to H3 errors', async () => {
    const res = await $fetch.raw(fixture.url('/api/error'), { ignoreResponseError: true })
    expect(res.status).toBe(404)
    expect(res._data).toMatchObject({ message: 'Task not found', data: { id: 'abc' } })
  })

  it('proxies Better Auth requests to the Convex site URL', async () => {
    upstream.length = 0
    const res = await $fetch.raw(fixture.url('/api/auth/sign-in/email?x=1'), {
      method: 'POST',
      body: { email: 'a@b.c' },
      headers: { 'cookie': 'c=1', 'x-forwarded-host': 'evil.example' },
    })

    expect(res._data).toEqual({ ok: true })
    expect(res.headers.getSetCookie()).toEqual(['a=1; Path=/', 'b=2; Path=/'])
    expect(upstream).toHaveLength(1)
    expect(upstream[0]).toMatchObject({ method: 'POST', url: '/api/auth/sign-in/email?x=1', body: JSON.stringify({ email: 'a@b.c' }) })
    expect(upstream[0]!.headers.cookie).toBe('c=1')
    expect(upstream[0]!.headers['x-forwarded-host']).toMatch(/^127\.0\.0\.1:\d+$/)
  })

  it('registers the public Nuxt aliases for app code', () => {
    expect(fixture.alias('#convex')).toBeTruthy()
    expect(fixture.alias('#convex/api')).toBeTruthy()
    expect(fixture.alias('#convex/advanced')).toBeTruthy()
    expect(fixture.alias('#convex/storage')).toBeTruthy()
    expect(fixture.alias('#convex/r2')).toBeUndefined()
    expect(fixture.alias('#convex/storage-refs')).toBeUndefined()
    expect(fixture.alias('#convex/server')).toBeUndefined()
    expect(fixture.alias('convex-vue')).toBeUndefined()
  })

  it('scaffolds storage functions when storage: true', () => {
    expect(existsSync(join(rootDir, 'convex/_hub/storage.ts'))).toBe(true)
  })

  it('points the generated aliases at the vue-convex package', () => {
    const rootModule = readFileSync(join(fixture.buildDir(), 'convex/index.mjs'), 'utf8')
    const storageModule = readFileSync(join(fixture.buildDir(), 'convex/storage.mjs'), 'utf8')
    const advancedModule = readFileSync(join(fixture.buildDir(), 'convex/advanced.mjs'), 'utf8')

    expect(rootModule).toMatch(/dist\/index\.mjs'/)
    expect(storageModule).toMatch(/dist\/storage\.mjs'/)
    expect(advancedModule).toMatch(/dist\/advanced\.mjs'/)
    expect(rootModule).not.toContain('/src/')
  })

  it('keeps storage refs behind a lazy internal runtime helper', () => {
    const storageRefsRuntime = readFileSync(join(fixture.buildDir(), 'convex/storage-refs-runtime.mjs'), 'utf8')

    expect(storageRefsRuntime).toMatch(/import\s+\{\s*api\s*\}\s+from\s+['"].*convex\/_generated\/api['"]/)
    expect(storageRefsRuntime).toContain('return api?._hub?.storage')
  })

  it('auto-imports the app composables', () => {
    const sharedImports = readFileSync(join(fixture.buildDir(), 'types/imports.d.ts'), 'utf8')

    expect(sharedImports).toContain('useConvexQuery')
    expect(sharedImports).toContain('useConvexAuth')
    expect(sharedImports).toContain('useConvexConnectionState')
    expect(sharedImports).toContain('useConvexStorage')
    expect(sharedImports).toContain('useConvexUpload')
    expect(sharedImports).not.toContain('useConvexR2Upload')
    expect(sharedImports).not.toContain('useConvexClient')
    expect(sharedImports).not.toContain('serverConvexQuery')
  })

  it('auto-imports the server helpers and types the token hook', () => {
    const serverImports = readFileSync(join(fixture.buildDir(), 'types/nitro-imports.d.ts'), 'utf8')
    const hooks = readFileSync(join(fixture.buildDir(), 'types/convex-server-hooks.d.ts'), 'utf8')

    for (const name of ['useConvexServer', 'serverConvexQuery', 'serverConvexMutation', 'serverConvexAction', 'getConvexToken', 'requireConvexAuth', 'toConvexH3Error'])
      expect(serverImports).toContain(name)
    expect(hooks).toContain(`'convex:token': ConvexTokenHook`)
    expect(hooks).toContain('$convexToken?: ConvexTokenGetter')
  })

  it('registers the Nuxt components', () => {
    const components = readFileSync(join(fixture.buildDir(), 'components.d.ts'), 'utf8')

    expect(components).toContain('ConvexQuery')
    expect(components).toContain('ConvexPaginatedQuery')
  })
})
