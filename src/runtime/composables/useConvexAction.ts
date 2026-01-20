import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { Ref } from 'vue'
import { ref } from 'vue'
import { getConvexClient } from '../client'

type ActionReference = FunctionReference<'action'>

export interface UseConvexActionReturn<Action extends ActionReference> {
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  execute: (args: FunctionArgs<Action>) => Promise<FunctionReturnType<Action>>
}

export function useConvexAction<Action extends ActionReference>(action: Action): UseConvexActionReturn<Action> {
  const client = getConvexClient()
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async (args: FunctionArgs<Action>): Promise<FunctionReturnType<Action>> => {
    isLoading.value = true
    error.value = null
    try {
      return await client.action(action, args)
    }
    catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      throw e
    }
    finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, execute }
}
