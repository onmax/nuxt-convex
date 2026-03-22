import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { ComputedRef, Ref } from 'vue'
import { useCommandState } from './internal/useCommandState'
import { requireRealtimeClient, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

type ActionReference = FunctionReference<'action'>

export interface UseConvexActionReturn<Action extends ActionReference> {
  execute: (args: FunctionArgs<Action>) => Promise<FunctionReturnType<Action>>
  error: Ref<Error | null>
  isPending: ComputedRef<boolean>
}

export function useConvexAction<Action extends ActionReference>(action: Action): UseConvexActionReturn<Action> {
  const { clientRef } = useConvexRuntimeContext()
  const { error, isPending, run } = useCommandState()

  return {
    execute: args => run(() => requireRealtimeClient(clientRef).action(action, args)),
    error,
    isPending,
  }
}
