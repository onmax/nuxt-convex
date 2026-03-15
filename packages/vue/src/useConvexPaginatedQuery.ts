import type { FunctionArgs, FunctionReference, FunctionReturnType, PaginationResult } from 'convex/server'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import { computed, nextTick, onScopeDispose, ref, toValue, watch } from 'vue'
import { useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

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
  error: Ref<Error | null>
  isDone: Ref<boolean>
  isPending: ComputedRef<boolean>
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

interface SuspenseController<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

function createSuspenseController<T>(): SuspenseController<T> {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve
    reject = nextReject
  })

  return { promise, resolve, reject }
}

export function useConvexPaginatedQuery<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<Omit<FunctionArgs<Query>, 'paginationOpts'>>,
  options: UseConvexPaginatedQueryOptions,
): UseConvexPaginatedQueryReturn<
  FunctionReturnType<Query> extends PaginationResult<infer Item> ? Item : never
> {
  const context = useConvexRuntimeContext()
  let unsubscribers: Array<(() => void) | undefined> = []
  const pages = ref<PaginationResult<any>[]>([])
  const error = ref<Error | null>(null)
  const isDone = ref(false)
  const isLoadingMore = ref(false)
  const lastPage = computed(() => pages.value.at(-1))
  let suspenseController = createSuspenseController<any[][]>()

  function resetState(): void {
    unsubscribers.forEach(unsubscribe => unsubscribe?.())
    unsubscribers = []
    pages.value = []
    error.value = null
    isDone.value = false
    isLoadingMore.value = false
    suspenseController = createSuspenseController<any[][]>()
  }

  function reset(reload: boolean): void {
    resetState()
    if (reload)
      nextTick(() => loadPage(0))
  }

  function loadPage(index: number): void {
    unsubscribers[index]?.()
    unsubscribers[index] = undefined

    const client = context.clientRef.value
    if (!client) {
      isLoadingMore.value = false
      return
    }

    if (index > 0)
      isLoadingMore.value = true

    const cursor = pages.value[index - 1]?.continueCursor ?? null
    const currentArgs = toValue(args) ?? {}

    unsubscribers[index] = client.onUpdate(
      query as PaginatedQueryReference<any>,
      {
        ...(currentArgs as Record<string, unknown>),
        paginationOpts: {
          cursor,
          numItems: options.numItems,
        },
      },
      (result) => {
        pages.value[index] = result
        error.value = null
        isDone.value = result.isDone
        isLoadingMore.value = false
        suspenseController.resolve(pages.value.map(page => page.page))
      },
      (err) => {
        error.value = err
        isLoadingMore.value = false
        suspenseController.reject(err)
        if (shouldResetOnError(err))
          reset(false)
      },
    )
  }

  const serializedArgs = computed(() => JSON.stringify(toValue(args)))

  watch(serializedArgs, (next, prev) => {
    if (next !== prev)
      reset(true)
  })
  watch(() => context.clientRef.value, () => reset(true))

  loadPage(0)
  onScopeDispose(() => reset(false))

  return {
    suspense: () => suspenseController.promise,
    pages: computed(() => pages.value.map(page => page.page)),
    data: computed(() => pages.value.flatMap(page => page.page)),
    lastPage,
    error,
    isDone,
    isPending: computed(() => pages.value.length === 0 && !error.value),
    isLoadingMore,
    loadMore: () => loadPage(pages.value.length),
    reset: () => reset(true),
  }
}
