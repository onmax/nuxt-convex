import type { ConvexClient, ConvexHttpClient } from 'convex/browser'
import { errors } from './internal/diagnostics'
import { useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

export function useConvexClient(): ConvexClient {
  const { clientRef } = useConvexRuntimeContext()

  if (!clientRef.value)
    throw errors.VUE_CONVEX_R0003()

  return clientRef.value
}

/** An unauthenticated HTTP client, created on first use. */
export function useConvexHttpClient(): ConvexHttpClient {
  const httpClient = useConvexRuntimeContext().getHttpClient()

  if (!httpClient)
    throw errors.VUE_CONVEX_R0004()

  return httpClient
}
