import type { ConnectionState } from 'convex/browser'
import type { ComputedRef, DeepReadonly, Ref } from 'vue'
import { useConvexRuntimeFacade } from './internal/session/facade'

export interface UseConvexConnectionStateReturn {
  state: DeepReadonly<Ref<ConnectionState | null>>
  isConnected: ComputedRef<boolean>
}

export function useConvexConnectionState(): UseConvexConnectionStateReturn {
  return useConvexRuntimeFacade().connection()
}
