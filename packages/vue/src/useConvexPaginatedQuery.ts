import type { FunctionArgs, FunctionReference, FunctionReturnType, PaginationResult } from 'convex/server'
import type { ComputedRef, DeepReadonly, MaybeRefOrGetter, Ref } from 'vue'
import { computed, nextTick, onScopeDispose, readonly, shallowRef, toValue, watch } from 'vue'
import { normalizeError, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

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
  error: DeepReadonly<Ref<Error | null>>
  isDone: DeepReadonly<Ref<boolean>>
  isPending: ComputedRef<boolean>
  isSkipped: ComputedRef<boolean>
  isLoadingMore: DeepReadonly<Ref<boolean>>
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
  args: MaybeRefOrGetter<Omit<FunctionArgs<Query>, 'paginationOpts'> | 'skip'>,
  options: UseConvexPaginatedQueryOptions,
): UseConvexPaginatedQueryReturn<
  FunctionReturnType<Query> extends PaginationResult<infer Item> ? Item : never
> {
  const context = useConvexRuntimeContext()
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

  function reset(reload: boolean): void {
    resetState()
    if (reload && !isSkipped.value)
      nextTick(() => loadPage(0))
  }

  function loadPage(index: number): void {
    if (isSkipped.value)
      return

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
        pages.value = pages.value
        error.value = null
        isDone.value = result.isDone
        isLoadingMore.value = false
        suspenseController.resolve(pages.value.map(page => page.page))
      },
      (err) => {
        error.value = normalizeError(err)
        isLoadingMore.value = false
        suspenseController.reject(error.value)
        if (shouldResetOnError(err))
          reset(false)
      },
    )
  }

  const serializedArgs = computed(() => {
    const v = toValue(args)
    return v === 'skip' ? 'skip' : JSON.stringify(v)
  })

  watch(serializedArgs, () => reset(true))
  watch(() => context.clientRef.value, () => reset(true))

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
