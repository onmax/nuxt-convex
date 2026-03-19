import type { FunctionArgs, FunctionReference, FunctionReturnType, PaginationResult } from 'convex/server'
import type { DeepReadonly, MaybeRefOrGetter, Ref } from 'vue'
import type { ConvexRuntimeContext } from '../runtime'
import type { ConvexTransportPort } from './transport'
import {
  type ConnectionResourceState,
  type PaginationResourceState,
  type QueriesResourceState,
  type QueryEntry,
  type QueryResourceState,
  createConnectionResource,
  createLiveValueResource,
  createPaginationResource,
  createQueriesResource,
  createQueryResource,
} from './reads'
import { createConvexTransportPort } from './transport'
import { useConvexRuntimeContext } from '../useConvexRuntimeContext'

type QueryReference = FunctionReference<'query'>

export interface ConvexRuntimeFacade {
  query: <Query extends QueryReference>(
    query: Query,
    args: MaybeRefOrGetter<FunctionArgs<Query> | 'skip'>,
    options?: { server?: boolean },
  ) => QueryResourceState<Query>
  queries: <T extends Record<string, QueryEntry>>(
    queries: MaybeRefOrGetter<T>,
  ) => QueriesResourceState<T>
  pagination: <Query extends QueryReference>(
    query: Query,
    args: MaybeRefOrGetter<Omit<FunctionArgs<Query>, 'paginationOpts'> | 'skip'>,
    options: { numItems: number },
  ) => PaginationResourceState<
    FunctionReturnType<Query> extends PaginationResult<infer Item> ? Item : never
  >
  connection: () => ConnectionResourceState
  liveValue: <Query extends QueryReference>(
    query: Query,
    args: MaybeRefOrGetter<FunctionArgs<Query>>,
    initialValue: FunctionReturnType<Query>,
  ) => DeepReadonly<Ref<FunctionReturnType<Query>>>
}

export function createConvexRuntimeFacade(
  context: ConvexRuntimeContext,
  transport: ConvexTransportPort = createConvexTransportPort(context),
): ConvexRuntimeFacade {
  return {
    query(query, args, options) {
      return createQueryResource(transport, query, args, {
        server: options?.server ?? context.optionsRef.value.server,
      })
    },
    queries(queries) {
      return createQueriesResource(transport, queries)
    },
    pagination(query, args, options) {
      return createPaginationResource(transport, query, args, options)
    },
    connection() {
      return createConnectionResource(transport)
    },
    liveValue(query, args, initialValue) {
      return createLiveValueResource(transport, query, args, initialValue)
    },
  }
}

export function useConvexRuntimeFacade(): ConvexRuntimeFacade {
  return createConvexRuntimeFacade(useConvexRuntimeContext())
}
