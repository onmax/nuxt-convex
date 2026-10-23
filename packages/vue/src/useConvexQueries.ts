import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { ConvexQueryError } from './useConvexQuery'
import { computed, onScopeDispose, shallowReadonly, shallowRef, toValue, triggerRef, watch } from 'vue'
import { queryKey } from './internal/hydration'
import { normalizeError, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

type QueryReference = FunctionReference<'query'>

export interface QueryEntry<Query extends QueryReference = QueryReference> {
  query: Query
  args: FunctionArgs<Query> | 'skip'
}

export interface UseConvexQueriesReturn<T extends Record<string, QueryEntry> = Record<string, QueryEntry>> {
  data: Readonly<Ref<{ [K in keyof T]?: T[K] extends QueryEntry<infer Q> ? FunctionReturnType<Q> : never }>>
  errors: Readonly<Ref<{ [K in keyof T]?: ConvexQueryError | null }>>
}

/** Subscribes to a keyed set of queries. Client only: on the server every entry stays `undefined`. */
export function useConvexQueries<T extends Record<string, QueryEntry>>(
  queries: MaybeRefOrGetter<T>,
): UseConvexQueriesReturn<T> {
  const { clientRef } = useConvexRuntimeContext()
  const data = shallowRef<Record<string, unknown>>({})
  const errors = shallowRef<Record<string, Error | null>>({})
  const subscriptions = new Map<string, { key: string, unsubscribe?: () => void }>()

  const set = (name: string, value: unknown, error: Error | null): void => {
    data.value[name] = value
    errors.value[name] = error
    triggerRef(data)
    triggerRef(errors)
  }

  // One string for all entries, so deep-equal args don't resubscribe.
  const keys = computed(() => Object.entries(toValue(queries)).map(([name, entry]) => {
    if (entry.args === 'skip')
      return [name, 'skip'] as const
    try {
      return [name, queryKey(entry.query, entry.args)] as const
    }
    catch (error) {
      return [name, `error|${normalizeError(error).message}`] as const
    }
  }))

  function sync(clientChanged: boolean): void {
    const current = toValue(queries)
    const client = clientRef.value

    for (const [name, subscription] of subscriptions) {
      if (!(name in current)) {
        subscription.unsubscribe?.()
        subscriptions.delete(name)
        delete data.value[name]
        delete errors.value[name]
        triggerRef(data)
        triggerRef(errors)
      }
    }

    for (const [name, key] of keys.value) {
      const previous = subscriptions.get(name)
      if (!clientChanged && previous?.key === key)
        continue

      const entry = current[name]!
      const subscription: { key: string, unsubscribe?: () => void } = { key }
      subscriptions.set(name, subscription)
      const isCurrent = (): boolean => subscriptions.get(name) === subscription

      if (entry.args === 'skip') {
        set(name, undefined, null)
      }
      else if (key.startsWith('error|')) {
        set(name, undefined, new Error(key.slice('error|'.length)))
      }
      else if (client) {
        try {
          subscription.unsubscribe = client.onUpdate(
            entry.query,
            entry.args,
            value => isCurrent() && set(name, value, null),
            error => isCurrent() && set(name, undefined, normalizeError(error)),
          )
        }
        catch (error) {
          set(name, undefined, normalizeError(error))
        }
      }
      previous?.unsubscribe?.()
    }
  }

  watch([keys, () => clientRef.value], ([, client], [, previousClient]) => sync(client !== previousClient), { immediate: true })
  onScopeDispose(() => {
    for (const subscription of subscriptions.values())
      subscription.unsubscribe?.()
    subscriptions.clear()
  }, true)

  // SAFETY: each key is only ever set from the subscription to `queries[key]`, so it holds that query's result.
  return {
    data: shallowReadonly(data) as UseConvexQueriesReturn<T>['data'],
    errors: shallowReadonly(errors) as UseConvexQueriesReturn<T>['errors'],
  }
}
