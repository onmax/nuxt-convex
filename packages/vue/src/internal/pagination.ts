import type { FunctionReference, PaginationResult } from 'convex/server'
import type { MaybeRefOrGetter } from 'vue'
import type { UseConvexPaginatedQueryOptions, UseConvexPaginatedQueryReturn } from '../useConvexPaginatedQuery'
import type { Settled } from './hydration'
import type { QueryStatus } from './resource'
import type { ConvexRuntimeContext } from './runtime'
import { computed, onScopeDispose, shallowReadonly, shallowRef, toValue, watch } from 'vue'
import { isConvexError, readErrorDataField } from './hydration'
import { createWaiters, makeAwaitable, useQueryTarget } from './resource'
import { normalizeError } from './useConvexRuntimeContext'

type PageArgs = Record<string, unknown> & { paginationOpts: Record<string, unknown> }

/**
 * One pagination session: the page subscriptions for one set of args. Ported from
 * `usePaginatedQuery` in `convex/react`: every session has its own `id` so it gets
 * fresh query journals, and pages that grow are split in two.
 */
interface Session<Item> {
  id: number
  args: Record<string, unknown>
  nextPageKey: number
  pageKeys: number[]
  pageArgs: Map<number, PageArgs>
  splits: Map<number, [number, number]>
  results: Map<number, PaginationResult<Item> | Error>
  unsubscribers: Map<number, () => void>
}

let nextSessionId = 0

// The cursor no longer matches the query (data-dependent pagination changed underneath us): restart.
function isInvalidCursor(error: Error): boolean {
  return (isConvexError(error) && readErrorDataField(error.data, 'paginationError') === 'InvalidCursor') || error.message.includes('InvalidCursor')
}

// `@click="loadMore"` passes the click event, which isn't a page size.
function isPageSize(value: unknown): value is number {
  return Number.isInteger(value)
}

export function createPaginationResource<Item>(
  context: ConvexRuntimeContext,
  query: MaybeRefOrGetter<FunctionReference<'query', 'public', any, PaginationResult<Item>>>,
  args: MaybeRefOrGetter<Record<string, unknown> | 'skip' | undefined>,
  options: UseConvexPaginatedQueryOptions,
): UseConvexPaginatedQueryReturn<Item> & PromiseLike<UseConvexPaginatedQueryReturn<Item>> {
  const data = shallowRef<Item[]>([])
  const error = shallowRef<Error | null>(null)
  const status = shallowRef<QueryStatus>('pending')
  const isDone = shallowRef(false)
  const isLoadingMore = shallowRef(false)
  const target = useQueryTarget(context, query, args, options.auth, `|paginated:${options.numItems}`)
  const waiters = createWaiters(() => status.value !== 'pending')
  let session: Session<Item> | undefined
  let lastPage: PaginationResult<Item> | undefined

  function setStatus(next: QueryStatus): void {
    status.value = next
    if (next !== 'pending')
      waiters.flush()
  }

  function stop(): void {
    session?.unsubscribers.forEach(unsubscribe => unsubscribe())
    session = undefined
    lastPage = undefined
    data.value = []
    isDone.value = false
    isLoadingMore.value = false
  }

  function start(baseArgs: Record<string, unknown>, seed?: Settled): void {
    stop()
    const id = ++nextSessionId
    session = {
      id,
      args: baseArgs,
      nextPageKey: 1,
      pageKeys: [0],
      pageArgs: new Map([[0, { ...baseArgs, paginationOpts: { numItems: options.numItems, cursor: null, id } }]]),
      splits: new Map(),
      results: new Map(),
      unsubscribers: new Map(),
    }
    if (seed)
      session.results.set(0, 'value' in seed ? seed.value : seed.error)
    error.value = null
    setStatus('pending')
    syncSubscriptions(session)
    evaluate()
  }

  function syncSubscriptions(current: Session<Item>): void {
    const client = context.clientRef.value
    if (!client)
      return
    for (const [key, unsubscribe] of current.unsubscribers) {
      if (!current.pageArgs.has(key)) {
        unsubscribe()
        current.unsubscribers.delete(key)
      }
    }
    for (const [key, pageArgs] of current.pageArgs) {
      if (current.unsubscribers.has(key))
        continue
      const onSettled = (result: PaginationResult<Item> | Error): void => {
        if (session !== current)
          return
        current.results.set(key, result)
        evaluate()
      }
      try {
        current.unsubscribers.set(key, client.onUpdate(toValue(query), pageArgs, onSettled, err => onSettled(normalizeError(err))))
      }
      catch (err) {
        onSettled(normalizeError(err))
      }
    }
  }

  function splitPage(current: Session<Item>, key: number, splitCursor: string, continueCursor: string): void {
    const paginationOpts = current.pageArgs.get(key)!.paginationOpts
    const first = current.nextPageKey++
    const second = current.nextPageKey++
    current.pageArgs.set(first, { ...current.args, paginationOpts: { ...paginationOpts, endCursor: splitCursor } })
    current.pageArgs.set(second, { ...current.args, paginationOpts: { ...paginationOpts, cursor: splitCursor, endCursor: continueCursor } })
    current.splits.set(key, [first, second])
    syncSubscriptions(current)
  }

  function completeSplit(current: Session<Item>, key: number): void {
    const split = current.splits.get(key)!
    current.pageKeys.splice(current.pageKeys.indexOf(key), 1, ...split)
    current.splits.delete(key)
    current.pageArgs.delete(key)
    current.results.delete(key)
    syncSubscriptions(current)
  }

  function evaluate(): void {
    const current = session
    if (!current)
      return

    const items: Item[] = []
    let last: PaginationResult<Item> | undefined
    let failure: Error | undefined
    let loadedAnyPage = false

    for (const key of current.pageKeys) {
      last = undefined
      const result = current.results.get(key)
      if (result === undefined)
        break
      if (result instanceof Error) {
        if (isInvalidCursor(result)) {
          console.warn(`[vue-convex] Restarting paginated query after: ${result.message}`)
          start(current.args)
          return
        }
        failure = result
        break
      }

      const split = current.splits.get(key)
      if (split) {
        if (current.results.has(split[0]) && current.results.has(split[1])) {
          completeSplit(current, key)
          return evaluate()
        }
      }
      else if (!context.isServer && result.splitCursor && (result.pageStatus === 'SplitRecommended' || result.pageStatus === 'SplitRequired' || result.page.length > options.numItems * 2)) {
        splitPage(current, key, result.splitCursor, result.continueCursor)
      }

      // The server couldn't read the whole page: stop before it until the split lands.
      if (result.pageStatus === 'SplitRequired')
        break
      items.push(...result.page)
      last = result
      loadedAnyPage = true
    }

    lastPage = last
    data.value = items
    error.value = failure ?? null
    isDone.value = !failure && !!last?.isDone
    isLoadingMore.value = !failure && loadedAnyPage && !last
    setStatus(failure ? 'error' : loadedAnyPage ? 'success' : 'pending')
  }

  function idle(): void {
    stop()
    error.value = null
    setStatus('idle')
  }

  function fail(err: Error): void {
    stop()
    error.value = err
    setStatus('error')
  }

  let ready: () => Promise<void>

  if (context.isServer) {
    const initial = target.value
    if ('error' in initial)
      fail(initial.error)
    else if (!('args' in initial))
      idle()

    ready = async () => {
      const current = target.value
      const enabled = options.server ?? context.optionsRef.value.server
      if (!enabled || status.value !== 'pending' || !('args' in current))
        return
      const firstPageArgs = { ...current.args, paginationOpts: { numItems: options.numItems, cursor: null } }
      const settled = await context.fetchServerQuery(current.key, toValue(query), firstPageArgs, options.auth === 'none')
      if (settled && target.value.key === current.key)
        start(current.args, settled)
    }
  }
  else {
    let previousKey: string | undefined
    // A getter, not the shallowRef itself: shallowRef sources force the watcher to fire on every change.
    watch([() => target.value.key, () => context.clientRef.value], ([key]) => {
      const current = target.value
      const isFirstRun = previousKey === undefined
      previousKey = key
      if ('error' in current)
        fail(current.error)
      else if (!('args' in current))
        idle()
      else
        start(current.args, isFirstRun ? context.readHydrated(key) : undefined)
    }, { immediate: true })

    onScopeDispose(() => {
      stop()
      waiters.dispose()
    }, true)
    ready = waiters.wait
  }

  const state: UseConvexPaginatedQueryReturn<Item> = {
    data: shallowReadonly(data),
    error: shallowReadonly(error),
    status: shallowReadonly(status),
    isPending: computed(() => status.value === 'pending'),
    isSkipped: computed(() => status.value === 'idle'),
    isDone: shallowReadonly(isDone),
    isLoadingMore: shallowReadonly(isLoadingMore),
    loadMore(numItems?: number) {
      const pageSize = isPageSize(numItems) ? numItems : options.numItems
      const current = session
      if (context.isServer || !current || !lastPage || status.value !== 'success' || isDone.value || isLoadingMore.value)
        return false
      const key = current.nextPageKey++
      current.pageKeys.push(key)
      current.pageArgs.set(key, { ...current.args, paginationOpts: { numItems: pageSize, cursor: lastPage.continueCursor, id: current.id } })
      syncSubscriptions(current)
      evaluate()
      return true
    },
    reset() {
      const current = target.value
      if ('args' in current && !context.isServer)
        start(current.args)
    },
    suspense: () => ready().then(() => {
      if (error.value)
        throw error.value
      return data.value
    }),
  }

  return makeAwaitable(state, ready)
}
