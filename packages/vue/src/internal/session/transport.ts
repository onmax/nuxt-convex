import type { ConnectionState, ConvexClient, ConvexHttpClient } from 'convex/browser'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { Value } from 'convex/values'
import type { ConvexRuntimeContext } from '../runtime'
import { getFunctionName } from 'convex/server'

type QueryReference = FunctionReference<'query'>

export interface ConvexTransportPort {
  getRealtimeClient: () => ConvexClient | undefined
  getHttpClient: () => ConvexHttpClient | undefined
  getCachedQueryResult: <Query extends QueryReference>(query: Query, args: FunctionArgs<Query>) => FunctionReturnType<Query> | undefined
  runHttpQuery: <Query extends QueryReference>(query: Query, args: FunctionArgs<Query>) => Promise<FunctionReturnType<Query>>
  subscribeQuery: <Query extends QueryReference>(
    query: Query,
    args: FunctionArgs<Query>,
    onResult: (value: FunctionReturnType<Query>) => void,
    onError: (error: Error) => void,
  ) => (() => void) | undefined
  getConnectionState: () => ConnectionState | null
  subscribeConnection: (onState: (state: ConnectionState) => void) => (() => void) | undefined
}

export function createConvexTransportPort(context: ConvexRuntimeContext): ConvexTransportPort {
  return {
    getRealtimeClient: () => context.clientRef.value,
    getHttpClient: () => context.httpClientRef.value,
    getCachedQueryResult(query, args) {
      const client = context.clientRef.value
      if (!client)
        return undefined

      const queryName = (query as { _name?: string })._name ?? getFunctionName(query)
      if (typeof queryName !== 'string')
        return undefined
      const cached = client.client?.localQueryResult?.(queryName, args as Record<string, Value>)
      return cached as FunctionReturnType<typeof query> | undefined
    },
    async runHttpQuery(query, args) {
      const client = context.httpClientRef.value
      if (!client)
        throw new Error('[convex-vue] Convex HTTP client is not connected')
      return await client.query(query, args)
    },
    subscribeQuery(query, args, onResult, onError) {
      const client = context.clientRef.value
      if (!client)
        return undefined

      try {
        return client.onUpdate(query, args, onResult, onError)
      }
      catch {
        return undefined
      }
    },
    getConnectionState() {
      const client = context.clientRef.value
      return client ? client.connectionState() : null
    },
    subscribeConnection(onState) {
      const client = context.clientRef.value
      if (!client)
        return undefined

      return client.subscribeToConnectionState(onState)
    },
  }
}
