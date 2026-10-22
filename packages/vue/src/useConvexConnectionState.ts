import type { ConnectionState } from 'convex/browser'
import type { ComputedRef, Ref } from 'vue'
import { computed, shallowReadonly, shallowRef, watch } from 'vue'
import { useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

export interface UseConvexConnectionStateReturn {
  state: Readonly<Ref<ConnectionState | null>>
  isConnected: ComputedRef<boolean>
}

export function useConvexConnectionState(): UseConvexConnectionStateReturn {
  const { clientRef } = useConvexRuntimeContext()
  const state = shallowRef<ConnectionState | null>(null)

  watch(clientRef, (client, _, onCleanup) => {
    state.value = client?.connectionState() ?? null
    if (!client)
      return
    onCleanup(client.subscribeToConnectionState((next) => {
      state.value = next
    }))
  }, { immediate: true })

  return {
    state: shallowReadonly(state),
    isConnected: computed(() => state.value?.isWebSocketConnected ?? false),
  }
}
