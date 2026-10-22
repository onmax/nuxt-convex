import type { ConvexClient } from 'convex/browser'
import type { ShallowRef } from 'vue'
import type { ConvexRuntimeContext } from './runtime'
import { hasInjectionContext, inject } from 'vue'
import { CONVEX_VUE_KEY } from './runtime'

export function useConvexRuntimeContext(): ConvexRuntimeContext {
  if (!hasInjectionContext())
    throw new Error('[convex-vue] Convex composables must be called inside setup(), a plugin, or app.runWithContext().')
  const context = inject(CONVEX_VUE_KEY, null)
  if (!context)
    throw new Error('[convex-vue] Convex is not installed on this app. Call app.use(convexVue, { url }) first.')
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
