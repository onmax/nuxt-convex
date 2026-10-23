import type { OptimisticUpdate } from 'convex/browser'
import type { FunctionArgs, FunctionReference, FunctionReturnType, OptionalRestArgs } from 'convex/server'
import type { ComputedRef, Ref } from 'vue'
import { useCommandState } from './internal/useCommandState'
import { requireRealtimeClient, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

type MutationReference = FunctionReference<'mutation'>

export interface UseConvexMutationOptions<Mutation extends MutationReference> {
  optimisticUpdate?: OptimisticUpdate<FunctionArgs<Mutation>>
}

export interface UseConvexMutationReturn<Mutation extends MutationReference> {
  mutate: (...args: OptionalRestArgs<Mutation>) => Promise<FunctionReturnType<Mutation>>
  /** Error of the most recent call. */
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
    // SAFETY: OptionalRestArgs only lets args be omitted when the mutation takes none, so `{}` is its args.
    mutate: (...args) => run(() => requireRealtimeClient(clientRef).mutation(
      mutation,
      (args[0] ?? {}) as FunctionArgs<Mutation>,
      options.optimisticUpdate ? { optimisticUpdate: options.optimisticUpdate } : undefined,
    )),
    error,
    isPending,
  }
}
