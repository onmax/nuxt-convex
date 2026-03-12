import type { ConvexClient } from 'convex/browser'
import { useConvexContext } from './internal/useConvexContext'

export function useConvexClient(): ConvexClient {
  const context = useConvexContext()
  if (!context.clientRef.value)
    throw new Error('[convex-vue] Convex client is not initialized')
  return context.clientRef.value
}
