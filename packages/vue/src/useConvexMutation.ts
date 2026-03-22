import type { OptimisticUpdate } from 'convex/browser'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { toValue } from 'vue'
import { useCommandState } from './internal/useCommandState'
import { requireRealtimeClient, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

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
  const { error, isPending, run } = useCommandState()

  return {
    mutate: args => run(() => requireRealtimeClient(clientRef).mutation(
      mutation,
      toValue(args),
      options.optimisticUpdate ? { optimisticUpdate: options.optimisticUpdate } : undefined,
    )),
    error,
    isPending,
  }
}
