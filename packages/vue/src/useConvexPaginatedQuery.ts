import type { FunctionArgs, FunctionReference, FunctionReturnType, PaginationOptions, PaginationResult } from 'convex/server'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { QueryAuthMode, QueryStatus } from './internal/resource'
import type { ConvexQueryError } from './useConvexQuery'
import { createPaginationResource } from './internal/pagination'
import { useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

type PaginatedQueryReference = FunctionReference<'query', 'public', { paginationOpts: PaginationOptions }, PaginationResult<any>>
type PaginatedQueryItem<Query extends PaginatedQueryReference> = FunctionReturnType<Query> extends PaginationResult<infer Item> ? Item : never

export interface UseConvexPaginatedQueryOptions {
  /** Items in the first page, and the default for `loadMore()`. */
  numItems: number
  /** Fetch the first page during SSR when awaited. Defaults to the plugin's `server` option. */
  server?: boolean
  /** How the query depends on auth. Defaults to `optional`. */
  auth?: QueryAuthMode
}

export interface UseConvexPaginatedQueryReturn<Item> {
  /** All loaded items, across pages. */
  data: Readonly<Ref<Item[]>>
  error: Readonly<Ref<ConvexQueryError | null>>
  /** `success` once the first page is loaded. */
  status: Readonly<Ref<QueryStatus>>
  isPending: ComputedRef<boolean>
  isSkipped: ComputedRef<boolean>
  isDone: Readonly<Ref<boolean>>
  isLoadingMore: Readonly<Ref<boolean>>
  /** Loads the next page. Returns `false` when there's nothing to load or a page is still loading. */
  loadMore: (numItems?: number) => boolean
  /** Drops loaded pages and starts again from the first page. */
  reset: () => void
  /** Resolves with the first page and rejects on error. Awaiting the composable itself never rejects. */
  suspense: () => Promise<Item[]>
}

export function useConvexPaginatedQuery<Query extends PaginatedQueryReference>(
  query: MaybeRefOrGetter<Query>,
  args: MaybeRefOrGetter<Omit<FunctionArgs<Query>, 'paginationOpts'> | 'skip'>,
  options: UseConvexPaginatedQueryOptions,
): UseConvexPaginatedQueryReturn<PaginatedQueryItem<Query>> & PromiseLike<UseConvexPaginatedQueryReturn<PaginatedQueryItem<Query>>> {
  return createPaginationResource(useConvexRuntimeContext(), query, args, options)
}
