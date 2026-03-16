import type { ConvexClient, ConvexHttpClient } from 'convex/browser'
import { useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

export function useConvexClient(): ConvexClient {
  const { clientRef } = useConvexRuntimeContext()

  if (!clientRef.value)
    throw new Error('[convex-vue/advanced] Convex realtime client is not connected. Use useConvexController() to connect first.')

  return clientRef.value
}

export function useConvexHttpClient(): ConvexHttpClient {
  const { httpClientRef } = useConvexRuntimeContext()

  if (!httpClientRef.value)
    throw new Error('[convex-vue/advanced] Convex HTTP client is not connected. Use useConvexController() to connect first.')

  return httpClientRef.value
}
