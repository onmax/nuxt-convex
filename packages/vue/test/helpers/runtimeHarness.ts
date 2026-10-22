import type { ConnectionState } from 'convex/browser'
import type { PaginationOptions, PaginationResult } from 'convex/server'
import { makeFunctionReference } from 'convex/server'
import { vi } from 'vitest'
import { createApp, effectScope } from 'vue'
import { convexVue } from '../../src/index'
import { convexVueStorage } from '../../src/storage'
import { useConvexController } from '../../src/useConvexController'

export interface QueryListener {
  name: string
  args: Record<string, any>
  onError: (error: Error) => void
  onResult: (value: any) => void
}

export interface MockRealtimeClient {
  action: ReturnType<typeof vi.fn>
  authListeners: Array<(isAuthenticated: boolean) => void>
  client: { clearAuth: ReturnType<typeof vi.fn>, localQueryResult: ReturnType<typeof vi.fn> }
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
  setAuth: ReturnType<typeof vi.fn>
  url: string
}

export const realtimeClients: MockRealtimeClient[] = []
export const httpClients: MockHttpClient[] = []
/** Backs `query()` of every mock HTTP client; receives the client as third argument. */
export const httpQuery = vi.fn()

vi.mock('convex/browser', async () => {
  const { getFunctionName } = await import('convex/server')
  function MockConvexClient(url: string, options: unknown): MockRealtimeClient {
    const listeners: QueryListener[] = []
    const connectionListeners: Array<(state: ConnectionState) => void> = []
    const authListeners: Array<(isAuthenticated: boolean) => void> = []
    const client: MockRealtimeClient = {
      action: vi.fn(),
      authListeners,
      client: {
        clearAuth: vi.fn(),
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
      onUpdate: vi.fn((query, args, onResult, onError) => {
        listeners.push({ name: getFunctionName(query), args, onError, onResult })
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
      query: vi.fn((query, args) => httpQuery(query, args, client)),
      setAuth: vi.fn(),
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
  httpQuery.mockReset()
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

/** Runs `fn` as if on the server: the runtime checks `typeof window` when an app is created. */
export function asServer<T>(fn: () => T): T {
  vi.stubGlobal('window', undefined)
  try {
    return fn()
  }
  finally {
    vi.unstubAllGlobals()
  }
}

export function createHarness({
  options = {},
  storageOptions,
}: {
  options?: Parameters<typeof convexVue.install>[1]
  storageOptions?: Parameters<typeof convexVueStorage.install>[1]
} = {}): {
  app: ReturnType<typeof createApp>
  controller: ReturnType<typeof useConvexController>
  run: <T>(factory: () => T) => T
  stop: () => void
} {
  const app = createApp({ render: () => null })
  app.use(convexVue, options ?? {})
  if (storageOptions)
    app.use(convexVueStorage, storageOptions)

  const scope = effectScope()

  return {
    app,
    controller: app.runWithContext(() => useConvexController()),
    run<T>(factory: () => T): T {
      return scope.run(() => app.runWithContext(factory))!
    },
    stop() {
      scope.stop()
    },
  }
}

export function page<T>(items: T[], overrides: Partial<PaginationResult<T>> = {}): PaginationResult<T> {
  return { page: items, isDone: false, continueCursor: `cursor-after-${items.length}`, ...overrides }
}

export const queryRef = makeFunctionReference<'query', { userId: string }, Array<{ _id: string }>>('tasks:list')
export const secondQueryRef = makeFunctionReference<'query', { id: string }, { _id: string }>('tasks:detail')
export const alternateQueryRef = makeFunctionReference<'query', { userId: string }, { total: number }>('tasks:summary')
export const mutationRef = makeFunctionReference<'mutation', { title: string }, string>('tasks:create')
export const noArgsMutationRef = makeFunctionReference<'mutation', Record<string, never>, string>('tasks:clear')
export const actionRef = makeFunctionReference<'action', { title: string }, string>('tasks:action')
export const paginatedRef = makeFunctionReference<
  'query',
  { userId: string, paginationOpts: PaginationOptions },
  PaginationResult<{ _id: string }>
>('tasks:paginated')
export const storageRefs = {
  generateUploadUrl: makeFunctionReference<'mutation', Record<string, never>, string>('_hub/storage:generateUploadUrl'),
  getUrl: makeFunctionReference<'query', { storageId: string }, string | null>('_hub/storage:getUrl'),
  remove: makeFunctionReference<'mutation', { storageId: string }, null>('_hub/storage:remove'),
}
