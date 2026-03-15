import type { FunctionReference, PaginationResult } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, ref } from 'vue'
import { createConvexVueController, useConvexController } from '../src/advanced'
import { convexVue, useConvexAction, useConvexMutation, useConvexPaginatedQuery, useConvexQuery } from '../src/index'
import { convexVueStorage, useConvexStorage, useConvexUpload } from '../src/storage'

interface QueryListener {
  args: Record<string, unknown>
  onError: (error: Error) => void
  onResult: (value: any) => void
}

interface MockRealtimeClient {
  action: ReturnType<typeof vi.fn>
  client: { localQueryResult: ReturnType<typeof vi.fn> }
  listeners: QueryListener[]
  mutation: ReturnType<typeof vi.fn>
  onUpdate: ReturnType<typeof vi.fn>
  options: unknown
  url: string
}

interface MockHttpClient {
  options: unknown
  query: ReturnType<typeof vi.fn>
  url: string
}

const realtimeClients: MockRealtimeClient[] = []
const httpClients: MockHttpClient[] = []

vi.mock('convex/browser', () => {
  return {
    ConvexClient: vi.fn(function MockConvexClient(url: string, options: unknown) {
      const listeners: QueryListener[] = []
      const client: MockRealtimeClient = {
        action: vi.fn(),
        client: {
          localQueryResult: vi.fn(() => undefined),
        },
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

function resetClients(): void {
  realtimeClients.length = 0
  httpClients.length = 0
}

function getLastRealtimeClient(): MockRealtimeClient {
  const client = realtimeClients.at(-1)
  if (!client)
    throw new Error('Expected a realtime client to be created')
  return client
}

function getLastHttpClient(): MockHttpClient {
  const client = httpClients.at(-1)
  if (!client)
    throw new Error('Expected an HTTP client to be created')
  return client
}

function createHarness({
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
    run<T>(factory: () => T): T {
      return scope.run(() => app.runWithContext(factory))!
    },
    stop() {
      scope.stop()
    },
  }
}

const queryRef = { _name: 'tasks:list' } as unknown as FunctionReference<'query'>
const mutationRef = { _name: 'tasks:create' } as unknown as FunctionReference<'mutation'>
const actionRef = { _name: 'tasks:action' } as unknown as FunctionReference<'action'>
const paginatedRef = { _name: 'tasks:paginated' } as unknown as FunctionReference<'query'>
const storageRefs = {
  generateUploadUrl: { _name: '_hub.storage.generateUploadUrl' } as unknown as FunctionReference<'mutation'>,
  getUrl: { _name: '_hub.storage.getUrl' } as unknown as FunctionReference<'query'>,
  remove: { _name: '_hub.storage.remove' } as unknown as FunctionReference<'mutation'>,
}

describe('@onmax/convex-vue public API', () => {
  let originalFetch: typeof globalThis.fetch | undefined

  beforeEach(() => {
    resetClients()
  })

  afterEach(() => {
    if (originalFetch)
      globalThis.fetch = originalFetch
    originalFetch = undefined
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('creates a disconnected controller until connect is called', () => {
    const controller = createConvexVueController()

    expect(controller.status.value).toBe('disconnected')
    expect(controller.getClient()).toBeUndefined()
    expect(controller.getHttpClient()).toBeUndefined()

    controller.connect({ url: 'https://test.convex.cloud' })

    expect(controller.status.value).toBe('connected')
    expect(controller.getHttpClient()).toBeTruthy()
  })

  it('reconfigures and disconnects the advanced controller', () => {
    const controller = createConvexVueController({ url: 'https://initial.convex.cloud' })

    controller.reconfigure({ url: 'https://next.convex.cloud', server: false })

    expect(controller.options.value.url).toBe('https://next.convex.cloud')
    expect(controller.options.value.server).toBe(false)

    controller.disconnect()

    expect(controller.status.value).toBe('disconnected')
    expect(controller.options.value.url).toBeUndefined()
    expect(controller.getClient()).toBeUndefined()
    expect(controller.getHttpClient()).toBeUndefined()
  })

  it('subscribes queries and surfaces realtime errors', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const client = getLastRealtimeClient()

    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))

    expect(state.isPending.value).toBe(true)
    client.listeners[0].onResult([{ _id: 'task-1' }])
    await nextTick()
    expect(state.data.value).toEqual([{ _id: 'task-1' }])
    expect(state.error.value).toBeNull()

    const failure = new Error('subscription failed')
    client.listeners[0].onError(failure)
    await nextTick()
    expect(state.data.value).toBeUndefined()
    expect(state.error.value).toBe(failure)

    harness.stop()
  })

  it('falls back to the http client when suspense waits for an initial client result', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const httpClient = getLastHttpClient()
    httpClient.query.mockResolvedValue([{ _id: 'task-http' }])

    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))

    await expect(state.suspense()).resolves.toEqual([{ _id: 'task-http' }])
    expect(httpClient.query).toHaveBeenCalledWith(queryRef, { userId: '1' })
    expect(state.data.value).toEqual([{ _id: 'task-http' }])

    harness.stop()
  })

  it('does not let stale suspense fetches overwrite data after args change', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const client = getLastRealtimeClient()
    const httpClient = getLastHttpClient()
    let resolveInitialFetch: ((value: Array<{ _id: string }>) => void) | null = null
    httpClient.query.mockImplementation(() => new Promise<Array<{ _id: string }>>((resolve) => {
      resolveInitialFetch = resolve
    }))

    const args = ref({ userId: '1' })
    const state = harness.run(() => useConvexQuery(queryRef, args))

    const staleFetch = state.suspense()

    args.value = { userId: '2' }
    await nextTick()

    client.listeners.at(-1)!.onResult([{ _id: 'task-live' }])
    await nextTick()

    expect(resolveInitialFetch).toBeTypeOf('function')
    resolveInitialFetch!([{ _id: 'task-stale' }])
    await expect(staleFetch).resolves.toEqual([{ _id: 'task-stale' }])
    expect(state.data.value).toEqual([{ _id: 'task-live' }])

    harness.stop()
  })

  it('waits for a later controller connection before resolving client queries', async () => {
    const harness = createHarness()
    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))

    const pending = state.suspense()
    harness.controller.connect({ url: 'https://late.convex.cloud' })
    await nextTick()

    const client = getLastRealtimeClient()
    client.listeners[0].onResult([{ _id: 'task-connected' }])

    await expect(pending).resolves.toEqual([{ _id: 'task-connected' }])
    expect(state.data.value).toEqual([{ _id: 'task-connected' }])

    harness.stop()
  })

  it('runs mutations and actions with Vue-native pending state', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const client = getLastRealtimeClient()
    client.mutation.mockResolvedValue('created-id')
    client.action.mockResolvedValue('done')

    const mutation = harness.run(() => useConvexMutation(mutationRef))
    const action = harness.run(() => useConvexAction(actionRef))

    await expect(mutation.mutate({ title: 'Task' })).resolves.toBe('created-id')
    await expect(action.execute({ title: 'Task' })).resolves.toBe('done')
    expect(mutation.isPending.value).toBe(false)
    expect(action.isPending.value).toBe(false)

    harness.stop()
  })

  it('recreates paginated suspense after reset', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const client = getLastRealtimeClient()

    const pagination = harness.run(() => useConvexPaginatedQuery(paginatedRef, {}, { numItems: 2 }))

    client.listeners[0].onResult({
      continueCursor: 'cursor-1',
      isDone: false,
      page: [{ _id: 'page-1' }],
    } satisfies PaginationResult<{ _id: string }>)

    await expect(pagination.suspense()).resolves.toEqual([[{ _id: 'page-1' }]])

    pagination.reset()
    await nextTick()

    client.listeners.at(-1)!.onResult({
      continueCursor: '',
      isDone: true,
      page: [{ _id: 'page-2' }],
    } satisfies PaginationResult<{ _id: string }>)

    await expect(pagination.suspense()).resolves.toEqual([[{ _id: 'page-2' }]])
    harness.stop()
  })

  it('configures storage through the /storage feature entrypoint', async () => {
    const harness = createHarness({
      options: { url: 'https://test.convex.cloud' },
      storageOptions: storageRefs,
    })
    const client = getLastRealtimeClient()
    client.mutation.mockImplementation(async (ref: { _name: string }) => {
      if (ref._name.endsWith('generateUploadUrl'))
        return 'https://upload.convex.dev'
      return undefined
    })

    const storage = harness.run(() => useConvexStorage())
    await expect(storage.generateUploadUrl()).resolves.toBe('https://upload.convex.dev')

    const fileUrl = harness.run(() => storage.getUrl('storage-1'))
    client.listeners[0].onResult('https://cdn.convex.dev/file.png')
    await nextTick()
    expect(fileUrl.value).toBe('https://cdn.convex.dev/file.png')

    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn(async () => ({
      json: async () => ({ storageId: 'storage-1' }),
      ok: true,
      status: 200,
      statusText: 'OK',
    })) as unknown as typeof fetch

    const upload = harness.run(() => useConvexUpload())
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

    await expect(upload.upload(file)).resolves.toBe('storage-1')
    await expect(storage.remove('storage-1')).resolves.toBeUndefined()
    expect(client.mutation).toHaveBeenCalledWith(storageRefs.remove, { storageId: 'storage-1' })

    harness.stop()
  })

  it('re-subscribes storage urls after the controller reconnects', async () => {
    const harness = createHarness({
      options: { url: 'https://test.convex.cloud' },
      storageOptions: storageRefs,
    })
    const storage = harness.run(() => useConvexStorage())
    const fileUrl = harness.run(() => storage.getUrl('storage-1'))
    const initialClient = getLastRealtimeClient()

    initialClient.listeners[0].onResult('https://cdn.convex.dev/initial.png')
    await nextTick()
    expect(fileUrl.value).toBe('https://cdn.convex.dev/initial.png')

    harness.controller.disconnect()
    await nextTick()
    expect(fileUrl.value).toBeNull()

    harness.controller.connect({ url: 'https://test.convex.cloud' })
    await nextTick()

    const reconnectedClient = getLastRealtimeClient()
    reconnectedClient.listeners[0].onResult('https://cdn.convex.dev/reconnected.png')
    await nextTick()
    expect(fileUrl.value).toBe('https://cdn.convex.dev/reconnected.png')

    harness.stop()
  })

  it('requires the /storage feature to be installed before using storage helpers', () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })

    expect(() => harness.run(() => useConvexStorage())).toThrow(
      '[convex-vue/storage] Storage feature is not configured. Install convexVueStorage first.',
    )

    harness.stop()
  })
})
