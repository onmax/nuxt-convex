import type { ConnectionState } from 'convex/browser'
import type { FunctionArgs, FunctionReference, FunctionReturnType, PaginationResult } from 'convex/server'
import type { Value } from 'convex/values'
import type { ComputedRef, DeepReadonly, MaybeRefOrGetter, Ref } from 'vue'
import type { ConvexTransportPort } from './transport'
import { computed, nextTick, onScopeDispose, readonly, shallowRef, toValue, triggerRef, watch } from 'vue'
import { normalizeError } from '../useConvexRuntimeContext'

type QueryReference = FunctionReference<'query'>
type PaginatedQueryReference<T> = FunctionReference<'query', any, any, PaginationResult<T>>

export interface QueryResourceOptions {
  server: boolean
}

export interface QueryResourceState<Query extends QueryReference> {
  data: DeepReadonly<Ref<FunctionReturnType<Query> | undefined>>
  error: DeepReadonly<Ref<Error | null>>
  isPending: ComputedRef<boolean>
  isSkipped: ComputedRef<boolean>
  suspense: () => Promise<FunctionReturnType<Query> | undefined>
}

export interface QueryEntry<Query extends QueryReference = QueryReference> {
  query: Query
  args: FunctionArgs<Query> | 'skip'
}

export interface QueriesResourceState<T extends Record<string, QueryEntry> = Record<string, QueryEntry>> {
  data: DeepReadonly<Ref<{ [K in keyof T]?: T[K] extends QueryEntry<infer Q> ? FunctionReturnType<Q> : never }>>
  errors: DeepReadonly<Ref<Record<string, Error | null>>>
}

export interface PaginationResourceState<T> {
  suspense: () => Promise<T[][]>
  pages: ComputedRef<T[][]>
  data: ComputedRef<T[]>
  lastPage: ComputedRef<PaginationResult<T> | undefined>
  error: DeepReadonly<Ref<Error | null>>
  isDone: DeepReadonly<Ref<boolean>>
  isPending: ComputedRef<boolean>
  isSkipped: ComputedRef<boolean>
  isLoadingMore: DeepReadonly<Ref<boolean>>
  loadMore: () => void
  reset: () => void
}

export interface ConnectionResourceState {
  state: DeepReadonly<Ref<ConnectionState | null>>
  isConnected: ComputedRef<boolean>
}

const RESETTABLE_PAGINATION_ERRORS = [
  'InvalidCursor',
  'ArrayTooLong',
  'TooManyReads',
  'TooManyDocumentsRead',
  'ReadsTooLarge',
]

function shouldResetOnError(error: Error): boolean {
  return RESETTABLE_PAGINATION_ERRORS.some(message => error.message.includes(message))
}

export function createQueryResource<Query extends QueryReference>(
  transport: ConvexTransportPort,
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query> | 'skip'>,
  options: QueryResourceOptions,
): QueryResourceState<Query> {
  const isServer = typeof window === 'undefined'
  const data = shallowRef<FunctionReturnType<Query> | undefined>(undefined)
  const error = shallowRef<Error | null>(null)
  const queryArgs = computed(() => toValue(args))
  const isSkipped = computed(() => queryArgs.value === 'skip')

  if (isServer) {
    const suspense = async (): Promise<FunctionReturnType<Query> | undefined> => {
      if (isSkipped.value || !options.server)
        return undefined

      try {
        const result = await transport.runHttpQuery(query, queryArgs.value as FunctionArgs<Query>)
        data.value = result
        error.value = null
        return result
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

  let unsubscribe: (() => void) | null = null
  let currentVersion = 0
  let pendingFetch: {
    version: number
    promise: Promise<FunctionReturnType<Query> | undefined>
  } | null = null

  const subscribe = (nextArgs: FunctionArgs<Query> | 'skip'): void => {
    unsubscribe?.()
    unsubscribe = null
    const version = ++currentVersion

    if (nextArgs === 'skip') {
      data.value = undefined
      error.value = null
      return
    }

    const cached = transport.getCachedQueryResult(query, nextArgs)
    if (cached !== undefined) {
      data.value = cached
      error.value = null
    }

    unsubscribe = transport.subscribeQuery(
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
        error.value = normalizeError(err)
      },
    ) ?? null
  }

  const fetchInitialData = async (): Promise<FunctionReturnType<Query> | undefined> => {
    if (!options.server)
      return undefined
    if (data.value !== undefined)
      return data.value
    if (error.value)
      throw error.value
    if (pendingFetch?.version === currentVersion)
      return await pendingFetch.promise
    if (!transport.getHttpClient())
      return undefined

    const version = currentVersion
    const nextArgs = queryArgs.value
    const promise = (async () => {
      try {
        const result = await transport.runHttpQuery(query, nextArgs as FunctionArgs<Query>)
        if (version === currentVersion) {
          data.value = result
          error.value = null
        }
        return result
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

  const waitForResult = (): Promise<FunctionReturnType<Query> | undefined> => new Promise((resolve, reject) => {
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

  watch([queryArgs, () => transport.getRealtimeClient()], ([nextArgs]) => subscribe(nextArgs), { immediate: true, deep: true })
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
      if (options.server && transport.getHttpClient())
        return fetchInitialData()

      return waitForResult()
    },
  }
}

export function createQueriesResource<T extends Record<string, QueryEntry>>(
  transport: ConvexTransportPort,
  queries: MaybeRefOrGetter<T>,
): QueriesResourceState<T> {
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

    const cached = transport.getCachedQueryResult(entry.query, entry.args)
    if (cached !== undefined) {
      data.value[key] = cached
      errors.value[key] = null
      triggerRef(data)
      triggerRef(errors)
    }

    const unsubscribe = transport.subscribeQuery(
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

    if (unsubscribe)
      unsubscribers.set(key, unsubscribe)
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

  watch([() => toValue(queries), () => transport.getRealtimeClient()], sync, { immediate: true, deep: true })
  onScopeDispose(() => {
    for (const unsubscribe of unsubscribers.values())
      unsubscribe()
    unsubscribers.clear()
    trackedArgs.clear()
  })

  return {
    data: readonly(data) as QueriesResourceState<T>['data'],
    errors: readonly(errors),
  }
}

export function createPaginationResource<Query extends QueryReference>(
  transport: ConvexTransportPort,
  query: Query,
  args: MaybeRefOrGetter<Omit<FunctionArgs<Query>, 'paginationOpts'> | 'skip'>,
  options: { numItems: number },
): PaginationResourceState<
  FunctionReturnType<Query> extends PaginationResult<infer Item> ? Item : never
> {
  let unsubscribers: Array<(() => void) | undefined> = []
  const pages = shallowRef<PaginationResult<any>[]>([])
  const error = shallowRef<Error | null>(null)
  const isDone = shallowRef(false)
  const isLoadingMore = shallowRef(false)
  const lastPage = computed(() => pages.value.at(-1))
  const isSkipped = computed(() => toValue(args) === 'skip')
  let suspenseController = Promise.withResolvers<any[][]>()

  function resetState(): void {
    unsubscribers.forEach(unsubscribe => unsubscribe?.())
    unsubscribers = []
    pages.value = []
    error.value = null
    isDone.value = false
    isLoadingMore.value = false
    suspenseController.promise.catch(() => {})
    suspenseController.reject(new Error('[convex-vue] Query was reset'))
    suspenseController = Promise.withResolvers<any[][]>()
  }

  function loadPage(index: number): void {
    if (isSkipped.value)
      return

    unsubscribers[index]?.()
    unsubscribers[index] = undefined

    const client = transport.getRealtimeClient()
    if (!client) {
      isLoadingMore.value = false
      return
    }

    if (index > 0)
      isLoadingMore.value = true

    const cursor = pages.value[index - 1]?.continueCursor ?? null
    const currentArgs = toValue(args) ?? {}

    unsubscribers[index] = transport.subscribeQuery(
      query as PaginatedQueryReference<any>,
      {
        ...(currentArgs as Record<string, unknown>),
        paginationOpts: {
          cursor,
          numItems: options.numItems,
        },
      } as FunctionArgs<Query>,
      (result) => {
        pages.value[index] = result as PaginationResult<any>
        triggerRef(pages)
        error.value = null
        isDone.value = (result as PaginationResult<any>).isDone
        isLoadingMore.value = false
        suspenseController.resolve(pages.value.map(page => page.page))
      },
      (err) => {
        error.value = normalizeError(err)
        isLoadingMore.value = false
        suspenseController.reject(error.value)
        if (shouldResetOnError(error.value))
          reset(false)
      },
    )
  }

  function reset(reload: boolean): void {
    resetState()
    if (reload && !isSkipped.value)
      nextTick(() => loadPage(0))
  }

  const serializedArgs = computed(() => {
    const value = toValue(args)
    return value === 'skip' ? 'skip' : JSON.stringify(value)
  })

  watch(serializedArgs, () => reset(true))
  watch(() => transport.getRealtimeClient(), () => reset(true))

  if (!isSkipped.value)
    loadPage(0)
  onScopeDispose(() => reset(false))

  return {
    suspense: () => {
      if (isSkipped.value)
        return Promise.resolve([])
      return suspenseController.promise
    },
    pages: computed(() => pages.value.map(page => page.page)),
    data: computed(() => pages.value.flatMap(page => page.page)),
    lastPage,
    error: readonly(error),
    isDone: readonly(isDone),
    isPending: computed(() => !isSkipped.value && pages.value.length === 0 && !error.value),
    isSkipped,
    isLoadingMore: readonly(isLoadingMore),
    loadMore: () => loadPage(pages.value.length),
    reset: () => reset(true),
  }
}

export function createConnectionResource(transport: ConvexTransportPort): ConnectionResourceState {
  const state = shallowRef<ConnectionState | null>(null)
  let unsubscribe: (() => void) | null = null

  const subscribe = (): void => {
    unsubscribe?.()
    unsubscribe = null
    state.value = transport.getConnectionState()
    unsubscribe = transport.subscribeConnection((next) => {
      state.value = next
    }) ?? null
  }

  watch(() => transport.getRealtimeClient(), subscribe, { immediate: true })
  onScopeDispose(() => unsubscribe?.())

  return {
    state: readonly(state),
    isConnected: computed(() => state.value?.isWebSocketConnected ?? false),
  }
}

export function createLiveValueResource<Query extends QueryReference>(
  transport: ConvexTransportPort,
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  initialValue: FunctionReturnType<Query>,
): DeepReadonly<Ref<FunctionReturnType<Query>>> {
  const data = shallowRef<FunctionReturnType<Query>>(initialValue)
  let unsubscribe: (() => void) | null = null

  const subscribe = (): void => {
    unsubscribe?.()
    unsubscribe = null

    if (typeof window === 'undefined') {
      data.value = initialValue
      return
    }

    unsubscribe = transport.subscribeQuery(
      query,
      toValue(args),
      (result) => {
        data.value = result
      },
      () => {},
    ) ?? null

    if (!unsubscribe)
      data.value = initialValue
  }

  watch([() => transport.getRealtimeClient(), () => toValue(args) as Value], subscribe, { immediate: true, deep: true })
  onScopeDispose(() => unsubscribe?.())
  return readonly(data)
}
