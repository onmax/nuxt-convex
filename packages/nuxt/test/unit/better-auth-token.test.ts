import { describe, expect, it, vi } from 'vitest'
import { createBetterAuthTokenFetcher } from '../../src/runtime/better-auth/token'

function setup(options: { session?: boolean, fetch?: (...args: any[]) => any } = {}) {
  let resolveReady!: () => void
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve
  })
  const fetch = vi.fn(options.fetch ?? (async () => ({ token: 'jwt-1' })))
  const fetchToken = createBetterAuthTokenFetcher({
    tokenPath: '/api/auth/convex/token',
    whenReady: () => ready,
    hasSession: () => options.session ?? true,
    fetch: fetch as any,
  })
  return { fetchToken, fetch, resolveReady }
}

describe('createBetterAuthTokenFetcher', () => {
  it('waits for Better Auth before asking for a token', async () => {
    const { fetchToken, fetch, resolveReady } = setup()
    const token = fetchToken({ forceRefreshToken: false })
    await Promise.resolve()
    expect(fetch).not.toHaveBeenCalled()

    resolveReady()
    expect(await token).toBe('jwt-1')
    expect(fetch).toHaveBeenCalledWith('/api/auth/convex/token', expect.objectContaining({ retry: 2 }))
  })

  it('returns null without a session and never calls the endpoint', async () => {
    const { fetchToken, fetch, resolveReady } = setup({ session: false })
    resolveReady()
    expect(await fetchToken({ forceRefreshToken: true })).toBeNull()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('reuses the token until Convex forces a refresh', async () => {
    const { fetchToken, fetch, resolveReady } = setup()
    resolveReady()
    await fetchToken({ forceRefreshToken: false })
    await fetchToken({ forceRefreshToken: false })
    expect(fetch).toHaveBeenCalledTimes(1)
    await fetchToken({ forceRefreshToken: true })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('treats 401 as signed out but keeps the token through network errors', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    let failure: unknown
    const { fetchToken, resolveReady } = setup({
      fetch: async () => {
        if (failure)
          throw failure
        return { token: 'jwt-1' }
      },
    })
    resolveReady()
    expect(await fetchToken({ forceRefreshToken: false })).toBe('jwt-1')

    failure = new TypeError('fetch failed')
    expect(await fetchToken({ forceRefreshToken: true })).toBe('jwt-1')
    expect(warn).toHaveBeenCalledTimes(1)

    failure = Object.assign(new Error('Unauthorized'), { response: { status: 401 } })
    expect(await fetchToken({ forceRefreshToken: true })).toBeNull()
    warn.mockRestore()
  })
})
