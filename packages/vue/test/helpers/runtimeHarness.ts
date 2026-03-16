import type { ConnectionState } from 'convex/browser'
import type { FunctionReference } from 'convex/server'
import { vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { createConvexVueController, useConvexClient, useConvexHttpClient } from '../../src/advanced'
import { useConvexRuntimeFacade } from '../../src/internal/session/facade'
import { convexVue, useConvexAction, useConvexConnectionState, useConvexMutation, useConvexPaginatedQuery, useConvexQueries, useConvexQuery } from '../../src/index'
import { convexVueStorage, useConvexStorage, useConvexUpload } from '../../src/storage'
import { useConvexController } from '../../src/useConvexController'

export interface QueryListener {
  args: Record<string, unknown>
  onError: (error: Error) => void
  onResult: (value: any) => void
}

export interface MockRealtimeClient {
  action: ReturnType<typeof vi.fn>
  client: { localQueryResult: ReturnType<typeof vi.fn> }
  close: ReturnType<typeof vi.fn>
  connectionListeners: Array<(state: ConnectionState) => void>
  connectionState: ReturnType<typeof vi.fn>
  connectionStateValue: ConnectionState
  listeners: QueryListener[]
  mutation: ReturnType<typeof vi.fn>
  onUpdate: ReturnType<typeof vi.fn>
  options: unknown
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
  return {
    ConvexClient: vi.fn(function MockConvexClient(url: string, options: unknown) {
      const listeners: QueryListener[] = []
      const connectionListeners: Array<(state: ConnectionState) => void> = []
      const client: MockRealtimeClient = {
        action: vi.fn(),
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
    }),
    ConvexHttpClient: vi.fn(function MockConvexHttpClient(url: string, options: unknown) {
      const client: MockHttpClient = {
        options,
        query: vi.fn(),
        url,
      }

      httpClients.push(client)
      return client
    }),
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

export function createHarness({
  options = {},
  storageOptions,
}: {
  options?: Parameters<typeof convexVue.install>[1]
  storageOptions?: Parameters<typeof convexVueStorage.install>[1]
} = {}) {
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

export const queryRef = { _name: 'tasks:list' } as unknown as FunctionReference<'query'>
export const secondQueryRef = { _name: 'tasks:detail' } as unknown as FunctionReference<'query'>
export const mutationRef = { _name: 'tasks:create' } as unknown as FunctionReference<'mutation'>
export const actionRef = { _name: 'tasks:action' } as unknown as FunctionReference<'action'>
export const paginatedRef = { _name: 'tasks:paginated' } as unknown as FunctionReference<'query'>
export const storageRefs = {
  generateUploadUrl: { _name: '_hub.storage.generateUploadUrl' } as unknown as FunctionReference<'mutation'>,
  getUrl: { _name: '_hub.storage.getUrl' } as unknown as FunctionReference<'query'>,
  remove: { _name: '_hub.storage.remove' } as unknown as FunctionReference<'mutation'>,
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
