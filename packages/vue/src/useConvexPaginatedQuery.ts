import type { FunctionArgs, FunctionReference, FunctionReturnType, PaginationResult } from 'convex/server'
import type { ComputedRef, DeepReadonly, MaybeRefOrGetter, Ref } from 'vue'
import { useConvexRuntimeFacade } from './internal/session/facade'

type QueryReference = FunctionReference<'query'>
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

export function useConvexPaginatedQuery<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<Omit<FunctionArgs<Query>, 'paginationOpts'> | 'skip'>,
  options: UseConvexPaginatedQueryOptions,
): UseConvexPaginatedQueryReturn<
  FunctionReturnType<Query> extends PaginationResult<infer Item> ? Item : never
> {
  return useConvexRuntimeFacade().pagination(query, args, options)
}
