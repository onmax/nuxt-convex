import type { ConnectionState } from 'convex/browser'
import type { FunctionReference, PaginationResult } from 'convex/server'
import { vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { createConvexVueController, useConvexClient, useConvexHttpClient } from '../../src/advanced'
import { convexVue, useConvexAction, useConvexConnectionState, useConvexMutation, useConvexPaginatedQuery, useConvexQueries, useConvexQuery } from '../../src/index'
import { useConvexRuntimeFacade } from '../../src/internal/session/facade'
import { convexVueStorage, useConvexStorage, useConvexUpload } from '../../src/storage'
import { useConvexController } from '../../src/useConvexController'

export interface QueryListener {
  args: Record<string, unknown>
  onError: (error: Error) => void
  onResult: (value: any) => void
}

export interface MockRealtimeClient {
  action: ReturnType<typeof vi.fn>
  authListeners: Array<(isAuthenticated: boolean) => void>
  client: { localQueryResult: ReturnType<typeof vi.fn> }
  close: ReturnType<typeof vi.fn>
  connectionListeners: Array<(state: ConnectionState) => void>
  connectionState: ReturnType<typeof vi.fn>
  connectionStateValue: ConnectionState
  listeners: QueryListener[]
  mutation: ReturnType<typeof vi.fn>
  onUpdate: ReturnType<typeof vi.fn>
  options: unknown
  setAuth: ReturnType<typeof vi.fn>
  subscribeToConnectionState: ReturnType<typeof vi.fn>
  url: string
}

export interface MockHttpClient {
  options: unknown
  query: ReturnType<typeof vi.fn>
  url: string
}

export const realtimeClients: MockRealtimeClient[] = []
export const httpClients: MockHttpClient[] = []

vi.mock('convex/browser', () => {
  function MockConvexClient(url: string, options: unknown): MockRealtimeClient {
    const listeners: QueryListener[] = []
    const connectionListeners: Array<(state: ConnectionState) => void> = []
    const authListeners: Array<(isAuthenticated: boolean) => void> = []
    const client: MockRealtimeClient = {
      action: vi.fn(),
      authListeners,
      client: {
        localQueryResult: vi.fn(() => undefined),
      },
      close: vi.fn(),
      connectionListeners,
      connectionState: vi.fn(() => client.connectionStateValue),
      connectionStateValue: {
        hasInflightRequests: false,
        isWebSocketConnected: false,
      } as ConnectionState,
      listeners,
      mutation: vi.fn(),
      onUpdate: vi.fn((_query, args, onResult, onError) => {
        listeners.push({ args, onError, onResult })
        return () => {
          const index = listeners.findIndex(listener => listener.onError === onError && listener.onResult === onResult)
          if (index >= 0)
            listeners.splice(index, 1)
        }
      }),
      options,
      setAuth: vi.fn((_fetchToken, onChange) => {
        authListeners.push(onChange)
      }),
      subscribeToConnectionState: vi.fn((onState) => {
        connectionListeners.push(onState)
        return () => {
          const index = connectionListeners.indexOf(onState)
          if (index >= 0)
            connectionListeners.splice(index, 1)
        }
      }),
      url,
    }

    realtimeClients.push(client)
    return client
  }

  function MockConvexHttpClient(url: string, options: unknown): MockHttpClient {
    const client: MockHttpClient = {
      options,
      query: vi.fn(),
      url,
    }

    httpClients.push(client)
    return client
  }

  return {
    ConvexClient: vi.fn(MockConvexClient),
    ConvexHttpClient: vi.fn(MockConvexHttpClient),
  }
})

export function resetClients(): void {
  realtimeClients.length = 0
  httpClients.length = 0
}

export function getLastRealtimeClient(): MockRealtimeClient {
  const client = realtimeClients.at(-1)
  if (!client)
    throw new Error('Expected a realtime client to be created')
  return client
}

export function getLastHttpClient(): MockHttpClient {
  const client = httpClients.at(-1)
  if (!client)
    throw new Error('Expected an HTTP client to be created')
  return client
}

export function emitConnectionState(client: MockRealtimeClient, state: Partial<ConnectionState>): void {
  client.connectionStateValue = {
    ...client.connectionStateValue,
    ...state,
  } as ConnectionState

  for (const listener of client.connectionListeners)
    listener(client.connectionStateValue)
}

export function emitAuthState(client: MockRealtimeClient, isAuthenticated: boolean): void {
  for (const listener of client.authListeners)
    listener(isAuthenticated)
}

export function createHarness({
  options = {},
  storageOptions,
}: {
  options?: Parameters<typeof convexVue.install>[1]
  storageOptions?: Parameters<typeof convexVueStorage.install>[1]
} = {}): {
  controller: ReturnType<typeof useConvexController>
  facade: ReturnType<typeof useConvexRuntimeFacade>
  run: <T>(factory: () => T) => T
  stop: () => void
} {
  const app = createApp({ render: () => null })
  app.use(convexVue, options ?? {})
  if (storageOptions)
    app.use(convexVueStorage, storageOptions)

  const scope = effectScope()

  return {
    controller: app.runWithContext(() => useConvexController()),
    facade: app.runWithContext(() => useConvexRuntimeFacade()),
    run<T>(factory: () => T): T {
      return scope.run(() => app.runWithContext(factory))!
    },
    stop() {
      scope.stop()
    },
  }
}

export const queryRef = { _name: 'tasks:list' } as unknown as FunctionReference<
  'query',
  'public',
  { userId: string },
  Array<{ _id: string }>
>
export const secondQueryRef = { _name: 'tasks:detail' } as unknown as FunctionReference<
  'query',
  'public',
  { id: string },
  { _id: string }
>
export const alternateQueryRef = { _name: 'tasks:summary' } as unknown as FunctionReference<
  'query',
  'public',
  { userId: string },
  { total: number }
>
export const mutationRef = { _name: 'tasks:create' } as unknown as FunctionReference<
  'mutation',
  'public',
  { title: string },
  string
>
export const actionRef = { _name: 'tasks:action' } as unknown as FunctionReference<
  'action',
  'public',
  { title: string },
  string
>
export const paginatedRef = { _name: 'tasks:paginated' } as unknown as FunctionReference<
  'query',
  'public',
  { userId: string, paginationOpts: { cursor: string | null, numItems: number } },
  PaginationResult<{ _id: string }>
>
export const storageRefs = {
  generateUploadUrl: { _name: '_hub.storage.generateUploadUrl' } as unknown as FunctionReference<'mutation', 'public', Record<never, never>, string>,
  getUrl: { _name: '_hub.storage.getUrl' } as unknown as FunctionReference<'query', 'public', { storageId: string }, string | null>,
  remove: { _name: '_hub.storage.remove' } as unknown as FunctionReference<'mutation', 'public', { storageId: string }, void>,
}

export {
  createConvexVueController,
  useConvexAction,
  useConvexClient,
  useConvexConnectionState,
  useConvexHttpClient,
  useConvexMutation,
  useConvexPaginatedQuery,
  useConvexQueries,
  useConvexQuery,
  useConvexStorage,
  useConvexUpload,
}
