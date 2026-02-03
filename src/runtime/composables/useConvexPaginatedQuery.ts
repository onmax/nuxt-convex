import type { FunctionArgs, FunctionReference, FunctionReturnType, PaginationResult } from 'convex/server'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { getFunctionName } from 'convex/server'
import { computed, nextTick, onScopeDispose, ref, toValue, watch } from 'vue'
import { getConvexClient } from '../client'

type QueryReference = FunctionReference<'query'>
type PaginatedQueryReference<T> = FunctionReference<'query', any, any, PaginationResult<T>>

export interface UseConvexPaginatedQueryOptions {
  numItems: number
}

export interface UseConvexPaginatedQueryReturn<T> {
  suspense: () => Promise<T[][]>
  pages: ComputedRef<T[][]>
  data: ComputedRef<T[]>
  lastPage: ComputedRef<PaginationResult<T> | undefined>
  error: Ref<Error | undefined>
  isDone: Ref<boolean>
  isLoading: ComputedRef<boolean>
  isLoadingMore: Ref<boolean>
  loadMore: () => void
  reset: () => void
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

export function useConvexPaginatedQuery<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<Omit<FunctionArgs<Query>, 'paginationOpts'>>,
  options: UseConvexPaginatedQueryOptions,
): UseConvexPaginatedQueryReturn<
  FunctionReturnType<Query> extends PaginationResult<infer Item> ? Item : never
> {
  const client = getConvexClient()
  const unsubscribers = ref<Array<(() => void) | undefined>>([])
  const pages = ref<PaginationResult<any>[]>([])
  const isDone = ref(false)
  const error = ref<Error | undefined>()
  const isLoadingMore = ref(false)
  const lastPage = computed(() => pages.value.at(-1))

  let resolveSuspense: (value: any) => void
  let rejectSuspense: (reason?: any) => void
  const suspensePromise = new Promise<any>((resolve, reject) => {
    resolveSuspense = resolve
    rejectSuspense = reject
  })

  function reset(reload: boolean): void {
    unsubscribers.value.forEach(unsubscribe => unsubscribe?.())
    unsubscribers.value = []
    pages.value = []
    if (reload)
      nextTick(() => loadPage(0))
  }

  function loadPage(index: number): void {
    unsubscribers.value[index]?.()
    if (pages.value.length)
      isLoadingMore.value = true

    const cursor = pages.value[index - 1]?.continueCursor ?? null
    const currentArgs = toValue(args) ?? {}

    unsubscribers.value[index] = client.onUpdate(
      query as PaginatedQueryReference<any>,
      {
        ...(currentArgs as Record<string, unknown>),
        paginationOpts: {
          numItems: options.numItems,
          cursor,
        },
      },
      (result) => {
        pages.value[index] = result as PaginationResult<any>
        resolveSuspense(pages.value.map(page => page.page))
        error.value = undefined
        isDone.value = result.isDone
        isLoadingMore.value = false
      },
      (err) => {
        const errorValue = err instanceof Error ? err : new Error(String(err))
        error.value = errorValue
        isLoadingMore.value = false
        rejectSuspense(errorValue)
        if (shouldResetOnError(errorValue))
          reset(false)
      },
    )
  }

  const serializedArgs = computed(() => JSON.stringify(toValue(args)))
  const queryName = computed(() => getFunctionName(query))

  watch(queryName, () => reset(true))
  watch(serializedArgs, (next, prev) => {
    if (next !== prev)
      reset(true)
  })

  loadPage(0)
  onScopeDispose(() => reset(false))

  return {
    suspense: () => suspensePromise,
    pages: computed(() => pages.value.map(page => page.page)),
    data: computed(() => pages.value.flatMap(page => page.page)),
    lastPage,
    error,
    isDone,
    isLoading: computed(() => !pages.value.length),
    isLoadingMore,
    loadMore: () => loadPage(pages.value.length),
    reset: () => reset(true),
  }
}
