import type { ConvexClient } from 'convex/browser'
import type { ShallowRef } from 'vue'
import type { ConvexRuntimeContext } from './runtime'
import { hasInjectionContext, inject } from 'vue'
import { errors } from './diagnostics'
import { isError } from './errors'
import { CONVEX_VUE_KEY } from './runtime'

export function useConvexRuntimeContext(): ConvexRuntimeContext {
  if (!hasInjectionContext())
    throw errors.VUE_CONVEX_R0001()
  const context = inject(CONVEX_VUE_KEY, null)
  if (!context)
    throw errors.VUE_CONVEX_R0002()
  return context
}

export function requireRealtimeClient(clientRef: ShallowRef<ConvexClient | undefined>): ConvexClient {
  if (!clientRef.value)
    throw errors.VUE_CONVEX_R0003()
  return clientRef.value
}

export function normalizeError(err: unknown): Error {
  return isError(err) ? err : new Error(String(err))
}
