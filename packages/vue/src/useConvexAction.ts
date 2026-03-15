import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import { normalizeError, requireRealtimeClient, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

type ActionReference = FunctionReference<'action'>

export interface UseConvexActionReturn<Action extends ActionReference> {
  execute: (args: FunctionArgs<Action>) => Promise<FunctionReturnType<Action>>
  error: Ref<Error | null>
  isPending: ComputedRef<boolean>
}

export function useConvexAction<Action extends ActionReference>(action: Action): UseConvexActionReturn<Action> {
  const { clientRef } = useConvexRuntimeContext()
  const pendingCount = ref(0)
  const error = ref<Error | null>(null)

  return {
    execute: async (args) => {
      pendingCount.value += 1
      error.value = null
      try {
        return await requireRealtimeClient(clientRef).action(action, args)
      }
      catch (err) {
        error.value = normalizeError(err)
        throw error.value
      }
      finally {
        pendingCount.value -= 1
      }
    },
    error,
    isPending: computed(() => pendingCount.value > 0),
  }
}
