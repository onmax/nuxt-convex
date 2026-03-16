import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { DeepReadonly, MaybeRefOrGetter, Ref } from 'vue'
import { useConvexRuntimeFacade } from './internal/session/facade'

type QueryReference = FunctionReference<'query'>

export interface QueryEntry<Query extends QueryReference = QueryReference> {
  query: Query
  args: FunctionArgs<Query> | 'skip'
}

export interface UseConvexQueriesReturn<T extends Record<string, QueryEntry> = Record<string, QueryEntry>> {
  data: DeepReadonly<Ref<{ [K in keyof T]?: T[K] extends QueryEntry<infer Q> ? FunctionReturnType<Q> : never }>>
  errors: DeepReadonly<Ref<Record<string, Error | null>>>
}

export function useConvexQueries<T extends Record<string, QueryEntry>>(
  queries: MaybeRefOrGetter<T>,
): UseConvexQueriesReturn<T> {
  return useConvexRuntimeFacade().queries(queries) as UseConvexQueriesReturn<T>
}
