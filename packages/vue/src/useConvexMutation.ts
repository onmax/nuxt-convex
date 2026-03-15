import type { OptimisticUpdate } from 'convex/browser'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, ref, toValue } from 'vue'
import { normalizeError, requireRealtimeClient, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

type MutationReference = FunctionReference<'mutation'>

export interface UseConvexMutationOptions<Mutation extends MutationReference> {
  optimisticUpdate?: OptimisticUpdate<FunctionArgs<Mutation>>
}

export interface UseConvexMutationReturn<Mutation extends MutationReference> {
  mutate: (args: MaybeRefOrGetter<FunctionArgs<Mutation>>) => Promise<FunctionReturnType<Mutation>>
  error: Ref<Error | null>
  isPending: ComputedRef<boolean>
}

export function useConvexMutation<Mutation extends MutationReference>(
  mutation: Mutation,
  options: UseConvexMutationOptions<Mutation> = {},
): UseConvexMutationReturn<Mutation> {
  const { clientRef } = useConvexRuntimeContext()
  const pendingCount = ref(0)
  const error = ref<Error | null>(null)

  return {
    mutate: async (args) => {
      pendingCount.value += 1
      error.value = null
      try {
        return await requireRealtimeClient(clientRef).mutation(
          mutation,
          toValue(args),
          options.optimisticUpdate ? { optimisticUpdate: options.optimisticUpdate } : undefined,
        )
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
