import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { onScopeDispose, ref, toValue, watch } from 'vue'
import { useConvexClient } from '../useConvexClient'

type QueryReference = FunctionReference<'query'>

export function useRealtimeQuery<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
): { data: Ref<FunctionReturnType<Query> | null>, error: Ref<Error | null> } {
  const client = useConvexClient()
  const data = ref<FunctionReturnType<Query> | null>(null)
  const error = ref<Error | null>(null)

  let unsubscribe: (() => void) | null = null

  const subscribe = (): void => {
    unsubscribe?.()
    unsubscribe = client.onUpdate(
      query,
      toValue(args),
      (result) => {
        data.value = result
        error.value = null
      },
      (err) => {
        error.value = err
      },
    )
  }

  watch(() => toValue(args), subscribe, { immediate: true, deep: true })
  onScopeDispose(() => unsubscribe?.())

  return { data, error }
}
