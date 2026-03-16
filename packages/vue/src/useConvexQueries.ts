import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { DeepReadonly, MaybeRefOrGetter, Ref } from 'vue'
import { onScopeDispose, readonly, shallowRef, toValue, triggerRef, watch } from 'vue'
import { normalizeError, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

type QueryReference = FunctionReference<'query'>

export interface QueryEntry<Query extends QueryReference = QueryReference> {
  query: Query
  args: FunctionArgs<Query> | 'skip'
}

export interface UseConvexQueriesReturn<T extends Record<string, QueryEntry> = Record<string, QueryEntry>> {
  data: DeepReadonly<Ref<{ [K in keyof T]?: T[K] extends QueryEntry<infer Q> ? FunctionReturnType<Q> : never }>>
  errors: DeepReadonly<Ref<Record<string, Error | null>>>
}

export function useConvexQueries<T extends Record<string, QueryEntry>>(
  queries: MaybeRefOrGetter<T>,
): UseConvexQueriesReturn<T> {
  const context = useConvexRuntimeContext()
  const data = shallowRef<Record<string, any>>({})
  const errors = shallowRef<Record<string, Error | null>>({})
  const unsubscribers = new Map<string, () => void>()
  const trackedArgs = new Map<string, string>()

  function subscribeKey(key: string, entry: QueryEntry): void {
    unsubscribers.get(key)?.()
    unsubscribers.delete(key)

    if (entry.args === 'skip') {
      data.value[key] = undefined
      errors.value[key] = null
      triggerRef(data)
      triggerRef(errors)
      return
    }

    const client = context.clientRef.value
    if (!client)
      return

    const unsub = client.onUpdate(
      entry.query,
      entry.args,
      (result) => {
        data.value[key] = result
        errors.value[key] = null
        triggerRef(data)
        triggerRef(errors)
      },
      (err) => {
        data.value[key] = undefined
        errors.value[key] = normalizeError(err)
        triggerRef(data)
        triggerRef(errors)
      },
    )
    unsubscribers.set(key, unsub)
  }

  function serializeEntry(entry: QueryEntry): string {
    return entry.args === 'skip' ? 'skip' : JSON.stringify(entry.args)
  }

  function sync(): void {
    const current = toValue(queries)
    const currentKeys = new Set(Object.keys(current))

    for (const key of unsubscribers.keys()) {
      if (!currentKeys.has(key)) {
        unsubscribers.get(key)?.()
        unsubscribers.delete(key)
        trackedArgs.delete(key)
      }
    }

    for (const [key, entry] of Object.entries(current)) {
      const serialized = serializeEntry(entry)
      if (trackedArgs.get(key) === serialized)
        continue
      trackedArgs.set(key, serialized)
      subscribeKey(key, entry)
    }
  }

  watch([() => toValue(queries), () => context.clientRef.value], sync, { immediate: true, deep: true })
  onScopeDispose(() => {
    for (const unsub of unsubscribers.values())
      unsub()
    unsubscribers.clear()
    trackedArgs.clear()
  })

  return {
    data: readonly(data) as UseConvexQueriesReturn<T>['data'],
    errors: readonly(errors),
  }
}
