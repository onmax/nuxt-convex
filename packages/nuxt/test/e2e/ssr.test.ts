import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setupSubprocessE2E } from '../helpers/subprocess-e2e'

const rootDir = fileURLToPath(new URL('../fixtures/ssr', import.meta.url))

function text(html: string, id: string): string | undefined {
  return html.match(new RegExp(`id="${id}"[^>]*>([^<]*)<`))?.[1]?.trim()
}

describe('nuxt-convex SSR', () => {
  const fixture = setupSubprocessE2E({
    rootDir,
    env: serverUrl => ({ NUXT_PUBLIC_CONVEX_URL: serverUrl.replace(/\/$/, '') }),
  })

  it('renders awaited queries, components and pagination on the server', async () => {
    const html = await fixture.fetch<string>('/', { responseType: 'text' })

    expect(text(html, 'awaited')).toBe('from-ssr')
    expect(text(html, 'paginated')).toBe('page-item')
    expect(text(html, 'whoami')).toBe('anonymous')
  })

  it('renders the #error slot instead of failing the request when a query throws', async () => {
    const html = await fixture.fetch<string>('/', { responseType: 'text' })

    expect(text(html, 'forbidden')).toBe('forbidden')
  })

  it('transfers results through the payload under $convex: keys', async () => {
    const html = await fixture.fetch<string>('/', { responseType: 'text' })

    expect(html).toContain('$convex:tasks:list|{}')
    expect(html).toContain('$convex:tasks:paginated|{}|paginated:5')
    expect(html).toContain('FORBIDDEN')
  })

  it('authenticates SSR with the request token and shares only isAuthenticated', async () => {
    const token = 'secret-test-token'
    const signedIn = await fixture.fetch<string>('/', { responseType: 'text', headers: { 'x-test-token': token } })
    const signedOut = await fixture.fetch<string>('/', { responseType: 'text' })

    expect(text(signedIn, 'whoami')).toBe(`user-of-${token.length}-char-token`)
    expect(text(signedIn, 'signed-in')).toBe('signed-in')
    expect(signedIn).not.toContain('id="signed-out"')
    expect(signedIn).not.toContain(token)
    expect(signedIn).toContain('convex:auth')

    expect(text(signedOut, 'signed-out')).toBe('signed-out')
    expect(signedOut).not.toContain('id="signed-in"')
  })
})
