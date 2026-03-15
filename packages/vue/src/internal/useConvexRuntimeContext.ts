import type { ConvexClient } from 'convex/browser'
import type { ShallowRef } from 'vue'
import type { ConvexRuntimeContext } from './runtime'
import { inject } from 'vue'
import { CONVEX_VUE_KEY } from './runtime'

export function useConvexRuntimeContext(): ConvexRuntimeContext {
  const context = inject(CONVEX_VUE_KEY)
  if (!context)
    throw new Error('[convex-vue] Convex plugin context not found')
  return context
}

export function requireRealtimeClient(clientRef: ShallowRef<ConvexClient | undefined>): ConvexClient {
  if (!clientRef.value)
    throw new Error('[convex-vue] Convex realtime client is not connected')
  return clientRef.value
}

export function normalizeError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err))
}
