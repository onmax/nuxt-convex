import type { FunctionArgs, FunctionReference, FunctionReturnType, OptionalRestArgs } from 'convex/server'
import type { ComputedRef, Ref } from 'vue'
import { useCommandState } from './internal/useCommandState'
import { requireRealtimeClient, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

type ActionReference = FunctionReference<'action'>

export interface UseConvexActionReturn<Action extends ActionReference> {
  execute: (...args: OptionalRestArgs<Action>) => Promise<FunctionReturnType<Action>>
  /** Error of the most recent call. */
  error: Ref<Error | null>
  isPending: ComputedRef<boolean>
}

export function useConvexAction<Action extends ActionReference>(action: Action): UseConvexActionReturn<Action> {
  const { clientRef } = useConvexRuntimeContext()
  const { error, isPending, run } = useCommandState()

  return {
    execute: (...args) => run(() => requireRealtimeClient(clientRef).action(action, (args[0] ?? {}) as FunctionArgs<Action>)),
    error,
    isPending,
  }
}
