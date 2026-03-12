import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, onScopeDispose, ref, toValue, watch } from 'vue'
import { useConvexContext } from './internal/useConvexContext'
import { useConvexClient } from './useConvexClient'

type QueryReference = FunctionReference<'query'>

export interface UseConvexQueryOptions {
  server?: boolean
}

export interface UseConvexQueryReturn<Query extends QueryReference> {
  data: Ref<FunctionReturnType<Query> | undefined>
  error: Ref<Error | null>
  isPending: Ref<boolean>
  suspense: () => Promise<FunctionReturnType<Query> | undefined>
}

export function useConvexQuery<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options?: UseConvexQueryOptions,
): UseConvexQueryReturn<Query> {
  const context = useConvexContext()
  const isServer = typeof window === 'undefined'
  const serverEnabled = options?.server ?? context.options.value.server

  if (isServer) {
    const data = ref<FunctionReturnType<Query> | undefined>(undefined)
    const error = ref<Error | null>(null)
    const suspense = async (): Promise<FunctionReturnType<Query> | undefined> => {
      if (!serverEnabled)
        return undefined

      try {
        const result = await context.httpClientRef.value?.query(query, toValue(args))
        data.value = result
        error.value = null
        return result as FunctionReturnType<Query>
      }
      catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err))
        throw error.value
      }
    }

    return {
      data,
      error,
      isPending: computed(() => serverEnabled && data.value === undefined && !error.value),
      suspense,
    }
  }

  const client = useConvexClient()
  const queryArgs = computed(() => toValue(args))
  const data = ref<FunctionReturnType<Query> | undefined>(undefined)
  const error = ref<Error | null>(null)

  let unsubscribe: (() => void) | null = null

  const subscribe = (nextArgs: FunctionArgs<Query>): void => {
    unsubscribe?.()
    unsubscribe = client.onUpdate(
      query,
      nextArgs,
      (result) => {
        data.value = result
        error.value = null
      },
      (err) => {
        data.value = undefined
        error.value = err
      },
    )
  }

  watch(queryArgs, subscribe, { immediate: true, deep: true })
  onScopeDispose(() => unsubscribe?.())

  return {
    data,
    error,
    isPending: computed(() => data.value === undefined && !error.value),
    suspense: () => {
      if (data.value !== undefined)
        return Promise.resolve(data.value)
      if (error.value)
        return Promise.reject(error.value)

      return new Promise((resolve, reject) => {
        const stop = watch([data, error], ([nextData, nextError]) => {
          if (nextError) {
            stop()
            reject(nextError)
            return
          }
          if (nextData !== undefined) {
            stop()
            resolve(nextData)
          }
        }, { immediate: true })
      })
    },
  }
}
