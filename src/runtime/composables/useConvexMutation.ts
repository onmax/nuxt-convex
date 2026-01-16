import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { getConvexClient } from '../client'

type MutationReference = FunctionReference<'mutation'>

export interface UseConvexMutationReturn<Mutation extends MutationReference> {
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  mutate: (args: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation>>
}

export function useConvexMutation<Mutation extends MutationReference>(mutation: Mutation): UseConvexMutationReturn<Mutation> {
  const client = getConvexClient()
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const mutate = async (args: FunctionArgs<Mutation>): Promise<FunctionReturnType<Mutation>> => {
    isLoading.value = true
    error.value = null
    try {
      return await client.mutation(mutation, args)
    }
    catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, mutate }
}
