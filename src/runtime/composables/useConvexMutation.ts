import type { OptimisticUpdate } from 'convex/browser'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { getConvexClient } from '../client'

type MutationReference = FunctionReference<'mutation'>

export interface UseConvexMutationOptions<Mutation extends MutationReference> {
  onSuccess?: (data: FunctionReturnType<Mutation>) => void
  onError?: (err: Error) => void
  optimisticUpdate?: OptimisticUpdate<FunctionArgs<Mutation>>
}

export interface UseConvexMutationReturn<Mutation extends MutationReference> {
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  mutate: (args: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation> | undefined>
}

export function useConvexMutation<Mutation extends MutationReference>(
  mutation: Mutation,
  options: UseConvexMutationOptions<Mutation> = {},
): UseConvexMutationReturn<Mutation> {
  const client = getConvexClient()
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const mutate = async (args: FunctionArgs<Mutation>): Promise<FunctionReturnType<Mutation> | undefined> => {
    isLoading.value = true
    error.value = null
    try {
      const result = await client.mutation(
        mutation,
        args,
        options.optimisticUpdate ? { optimisticUpdate: options.optimisticUpdate } : undefined,
      )
      options.onSuccess?.(result as FunctionReturnType<Mutation>)
      return result as FunctionReturnType<Mutation>
    }
    catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err
      options.onError?.(err)
      return undefined
    }
    finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, mutate }
}
