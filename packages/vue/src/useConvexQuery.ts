import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { Value } from 'convex/values'
import type { ComputedRef, DeepReadonly, MaybeRefOrGetter, Ref } from 'vue'
import { getFunctionName } from 'convex/server'
import { computed, onScopeDispose, readonly, shallowRef, toValue, watch } from 'vue'
import { normalizeError, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

type QueryReference = FunctionReference<'query'>

export interface UseConvexQueryOptions {
  server?: boolean
}

export interface UseConvexQueryReturn<Query extends QueryReference> {
  data: DeepReadonly<Ref<FunctionReturnType<Query> | undefined>>
  error: DeepReadonly<Ref<Error | null>>
  isPending: ComputedRef<boolean>
  isSkipped: ComputedRef<boolean>
  suspense: () => Promise<FunctionReturnType<Query> | undefined>
}

export function useConvexQuery<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query> | 'skip'>,
  options?: UseConvexQueryOptions,
): UseConvexQueryReturn<Query> {
  const context = useConvexRuntimeContext()
  const isServer = typeof window === 'undefined'
  const serverEnabled = options?.server ?? context.optionsRef.value.server

  if (isServer) {
    const data = shallowRef<FunctionReturnType<Query> | undefined>(undefined)
    const error = shallowRef<Error | null>(null)
    const isSkipped = computed(() => toValue(args) === 'skip')

    const suspense = async (): Promise<FunctionReturnType<Query> | undefined> => {
      if (isSkipped.value)
        return undefined
      if (!serverEnabled)
        return undefined

      if (!context.httpClientRef.value)
        throw new Error('[convex-vue] Convex HTTP client is not connected')

      try {
        const result = await context.httpClientRef.value.query(query, toValue(args) as FunctionArgs<Query>)
        data.value = result
        error.value = null
        return result as FunctionReturnType<Query>
      }
      catch (err) {
        error.value = normalizeError(err)
        throw error.value
      }
    }

    return {
      data: readonly(data),
      error: readonly(error),
      isPending: computed(() => !isSkipped.value && data.value === undefined && !error.value),
      isSkipped,
      suspense,
    }
  }

  const queryArgs = computed(() => toValue(args))
  const isSkipped = computed(() => queryArgs.value === 'skip')
  const data = shallowRef<FunctionReturnType<Query> | undefined>(undefined)
  const error = shallowRef<Error | null>(null)
  const queryName = (query as { _name?: string })._name ?? getFunctionName(query)

  let unsubscribe: (() => void) | null = null
  let currentVersion = 0
  let pendingFetch: {
    version: number
    promise: Promise<FunctionReturnType<Query> | undefined>
  } | null = null

  const seedFromClientCache = (nextArgs: FunctionArgs<Query>): void => {
    const client = context.clientRef.value
    if (!client)
      return

    const cached = client.client?.localQueryResult?.(queryName, nextArgs as Record<string, Value>)
    if (cached === undefined)
      return

    data.value = cached as FunctionReturnType<Query>
    error.value = null
  }

  const subscribe = (nextArgs: FunctionArgs<Query> | 'skip'): void => {
    unsubscribe?.()
    unsubscribe = null
    const version = ++currentVersion

    if (nextArgs === 'skip') {
      data.value = undefined
      error.value = null
      return
    }

    const client = context.clientRef.value
    seedFromClientCache(nextArgs)

    if (!client)
      return

    unsubscribe = client.onUpdate(
      query,
      nextArgs,
      (result) => {
        if (version !== currentVersion)
          return
        data.value = result
        error.value = null
      },
      (err) => {
        if (version !== currentVersion)
          return
        data.value = undefined
        error.value = err
      },
    )
  }

  const fetchInitialData = async (): Promise<FunctionReturnType<Query> | undefined> => {
    if (!serverEnabled)
      return undefined
    if (data.value !== undefined)
      return data.value
    if (error.value)
      throw error.value
    if (pendingFetch?.version === currentVersion)
      return await pendingFetch.promise
    if (!context.httpClientRef.value)
      return undefined

    const version = currentVersion
    const nextArgs = queryArgs.value
    const promise = (async () => {
      try {
        const result = await context.httpClientRef.value?.query(query, nextArgs as FunctionArgs<Query>)
        if (version === currentVersion) {
          data.value = result as FunctionReturnType<Query> | undefined
          error.value = null
        }
        return result as FunctionReturnType<Query> | undefined
      }
      catch (err) {
        const normalizedError = normalizeError(err)
        if (version === currentVersion)
          error.value = normalizedError
        throw normalizedError
      }
      finally {
        if (pendingFetch?.version === version)
          pendingFetch = null
      }
    })()

    pendingFetch = { version, promise }
    return await promise
  }

  const waitForResult = () => new Promise<FunctionReturnType<Query> | undefined>((resolve, reject) => {
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

  watch([queryArgs, () => context.clientRef.value], ([nextArgs]) => subscribe(nextArgs), { immediate: true, deep: true })
  onScopeDispose(() => unsubscribe?.())

  return {
    data: readonly(data),
    error: readonly(error),
    isPending: computed(() => !isSkipped.value && data.value === undefined && !error.value),
    isSkipped,
    suspense: () => {
      if (isSkipped.value)
        return Promise.resolve(undefined)
      if (data.value !== undefined)
        return Promise.resolve(data.value)
      if (error.value)
        return Promise.reject(error.value)
      if (serverEnabled && context.httpClientRef.value)
        return fetchInitialData()

      return waitForResult()
    },
  }
}
