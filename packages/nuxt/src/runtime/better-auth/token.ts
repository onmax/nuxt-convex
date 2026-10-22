import type { AuthTokenFetcher } from 'convex/browser'

export interface BetterAuthTokenFetcherOptions {
  tokenPath: string
  /** Resolves once Better Auth knows whether there's a session */
  whenReady: () => Promise<void>
  hasSession: () => boolean
  fetch?: typeof $fetch
}

/** A Convex `fetchToken` that reads the JWT from `@convex-dev/better-auth`'s token endpoint */
export function createBetterAuthTokenFetcher(options: BetterAuthTokenFetcherOptions): AuthTokenFetcher {
  const fetch = options.fetch ?? $fetch
  let cached: string | null = null

  return async ({ forceRefreshToken }) => {
    await options.whenReady()
    if (!options.hasSession())
      return cached = null
    if (cached && !forceRefreshToken)
      return cached

    try {
      const data = await fetch<{ token?: string | null }>(options.tokenPath, { retry: 2, retryDelay: 1000 })
      return cached = data?.token ?? null
    }
    catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status
      if (status === 401 || status === 403)
        return cached = null
      // A network error isn't a sign-out: keep the current token, Convex asks again when it expires
      console.warn('[nuxt-convex] Could not fetch the Convex token from Better Auth.', error)
      return cached
    }
  }
}
