import type { FunctionArgs, FunctionReference } from 'convex/server'
import type { DeepReadonly, MaybeRefOrGetter, Ref } from 'vue'
import type { ConvexRuntimeContext } from '../runtime'
import type { ConvexTransportPort } from './transport'
import {
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
  ) => ReturnType<typeof createQueryResource<Query>>
  queries: typeof createQueriesResource
  pagination: typeof createPaginationResource
  connection: typeof createConnectionResource
  liveValue: <Query extends QueryReference>(
    query: Query,
    args: MaybeRefOrGetter<FunctionArgs<Query>>,
    initialValue: ReturnType<typeof createLiveValueResource<Query>> extends DeepReadonly<Ref<infer T>> ? T : never,
  ) => ReturnType<typeof createLiveValueResource<Query>>
}

export function createConvexRuntimeFacade(
  context: ConvexRuntimeContext,
  transport: ConvexTransportPort = createConvexTransportPort(context),
): ConvexRuntimeFacade {
  return {
    query(query, args, options) {
      return createQueryResource(transport, args, query, {
        server: options?.server ?? context.optionsRef.value.server,
      })
    },
    queries(queries) {
      return createQueriesResource(transport, queries)
    },
    pagination(query, args, options) {
      return createPaginationResource(transport, args, options, query)
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
