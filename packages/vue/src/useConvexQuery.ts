import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { ComputedRef, DeepReadonly, MaybeRefOrGetter, Ref } from 'vue'
import { useConvexRuntimeFacade } from './internal/session/facade'

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
  return useConvexRuntimeFacade().query(query, args, options)
}
