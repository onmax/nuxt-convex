import type { ConvexClient, ConvexHttpClient } from 'convex/browser'
import { useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

export function useConvexClient(): ConvexClient {
  const { clientRef } = useConvexRuntimeContext()

  if (!clientRef.value)
    throw new Error('[vue-convex/advanced] Convex realtime client is not connected. Use useConvexController() to connect first.')

  return clientRef.value
}

/** An unauthenticated HTTP client, created on first use. */
export function useConvexHttpClient(): ConvexHttpClient {
  const httpClient = useConvexRuntimeContext().getHttpClient()

  if (!httpClient)
    throw new Error('[vue-convex/advanced] Convex HTTP client is not connected. Use useConvexController() to connect first.')

  return httpClient
}
