import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { ConvexError, Value } from 'convex/values'
import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { QueryAuthMode, QueryStatus } from './internal/resource'
import { createQueryResource } from './internal/query'
import { useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

type QueryReference = FunctionReference<'query'>

/** Errors are plain `Error`s, or `ConvexError`s carrying the data thrown by your function. See `isConvexError`. */
export type ConvexQueryError = Error | ConvexError<Value>

export interface UseConvexQueryOptions {
  /** Fetch during SSR when awaited. Defaults to the plugin's `server` option. */
  server?: boolean
  /** Keep the previous result while the query for new args loads. */
  keepPreviousData?: boolean
  /** How the query depends on auth. Defaults to `optional`. */
  auth?: QueryAuthMode
}

export interface UseConvexQueryReturn<Query extends QueryReference> {
  data: Readonly<Ref<FunctionReturnType<Query> | undefined>>
  error: Readonly<Ref<ConvexQueryError | null>>
  status: Readonly<Ref<QueryStatus>>
  isPending: ComputedRef<boolean>
  isSkipped: ComputedRef<boolean>
  /** Resolves with the first result and rejects on error. Awaiting the composable itself never rejects. */
  suspense: () => Promise<FunctionReturnType<Query> | undefined>
}

/**
 * Subscribes to a Convex query. Await the return value to wait for the first
 * result: on the server that fetches over HTTP, on the client it resolves
 * immediately with hydrated data or waits for the WebSocket.
 */
export function useConvexQuery<Query extends QueryReference>(
  query: MaybeRefOrGetter<Query>,
  args: MaybeRefOrGetter<FunctionArgs<Query> | 'skip'>,
  options?: UseConvexQueryOptions,
): UseConvexQueryReturn<Query> & PromiseLike<UseConvexQueryReturn<Query>> {
  return createQueryResource(useConvexRuntimeContext(), query, args, options)
}
