import type { ConnectionState } from 'convex/browser'
import type { ComputedRef, DeepReadonly, Ref } from 'vue'
import { computed, onScopeDispose, readonly, shallowRef, watch } from 'vue'
import { useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

export interface UseConvexConnectionStateReturn {
  state: DeepReadonly<Ref<ConnectionState | null>>
  isConnected: ComputedRef<boolean>
}

export function useConvexConnectionState(): UseConvexConnectionStateReturn {
  const { clientRef } = useConvexRuntimeContext()
  const state = shallowRef<ConnectionState | null>(null)
  let unsubscribe: (() => void) | null = null

  const subscribe = (): void => {
    unsubscribe?.()
    unsubscribe = null
    const client = clientRef.value
    if (!client) {
      state.value = null
      return
    }
    state.value = client.connectionState()
    unsubscribe = client.subscribeToConnectionState((next) => {
      state.value = next
    })
  }

  watch(clientRef, subscribe, { immediate: true })
  onScopeDispose(() => unsubscribe?.())

  return {
    state: readonly(state),
    isConnected: computed(() => state.value?.isWebSocketConnected ?? false),
  }
}
