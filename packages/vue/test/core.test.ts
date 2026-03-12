import type { FunctionReference, PaginationResult } from 'convex/server'
import type { ConvexStorageReferences, ConvexVueContext, ResolvedConvexVueOptions } from '../src/internal/context'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, effectScope, nextTick, ref, shallowRef } from 'vue'
import { CONVEX_VUE_KEY } from '../src/internal/context'
import { useConvexAction } from '../src/useConvexAction'
import { useConvexMutation } from '../src/useConvexMutation'
import { useConvexPaginatedQuery } from '../src/useConvexPaginatedQuery'
import { useConvexQuery } from '../src/useConvexQuery'
import { useConvexStorage } from '../src/useConvexStorage'
import { useConvexUpload } from '../src/useConvexUpload'

interface QueryListener {
  onResult: (value: any) => void
  onError: (error: Error) => void
}

function createHarness({
  client,
  httpClient,
  storage,
}: {
  client?: Record<string, any>
  httpClient?: { query: ReturnType<typeof vi.fn> }
  storage?: ConvexStorageReferences
}) {
  const app = createApp({ render: () => null })
  const context: ConvexVueContext = {
    options: ref<ResolvedConvexVueOptions>({
      url: 'https://test.convex.cloud',
      server: true,
      storage,
    }),
    clientRef: shallowRef(client) as ConvexVueContext['clientRef'],
    httpClientRef: shallowRef(httpClient as ConvexVueContext['httpClientRef']['value']) as ConvexVueContext['httpClientRef'],
    initClient: vi.fn(),
  }

  app.provide(CONVEX_VUE_KEY, context)
  const scope = effectScope()

  return {
    context,
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

describe('@onmax/convex-vue', () => {
  const listeners: QueryListener[] = []
  let originalFetch: typeof globalThis.fetch | undefined

  beforeEach(() => {
    listeners.length = 0
  })

  afterEach(() => {
    if (originalFetch)
      globalThis.fetch = originalFetch
    originalFetch = undefined
    vi.unstubAllGlobals()
  })

  it('subscribes queries and surfaces realtime errors', async () => {
    const harness = createHarness({
      client: {
        localQueryResult: vi.fn(() => undefined),
        onUpdate: vi.fn((_query, _args, onResult, onError) => {
          listeners.push({ onResult, onError })
          return () => {}
        }),
      },
    })

    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))

    expect(state.isPending.value).toBe(true)
    listeners[0].onResult([{ _id: 'task-1' }])
    await nextTick()
    expect(state.data.value).toEqual([{ _id: 'task-1' }])
    expect(state.error.value).toBeNull()

    const failure = new Error('subscription failed')
    listeners[0].onError(failure)
    await nextTick()
    expect(state.data.value).toBeUndefined()
    expect(state.error.value).toBe(failure)

    harness.stop()
  })

  it('falls back to the http client when suspense waits for an initial client result', async () => {
    const httpClient = {
      query: vi.fn(async () => [{ _id: 'task-http' }]),
    }
    const harness = createHarness({
      client: {
        onUpdate: vi.fn(() => () => {}),
      },
      httpClient,
    })

    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))

    await expect(state.suspense()).resolves.toEqual([{ _id: 'task-http' }])
    expect(httpClient.query).toHaveBeenCalledWith(queryRef, { userId: '1' })
    expect(state.data.value).toEqual([{ _id: 'task-http' }])

    harness.stop()
  })

  it('does not let stale suspense fetches overwrite data after args change', async () => {
    let resolveInitialFetch: ((value: Array<{ _id: string }>) => void) | null = null
    const httpClient = {
      query: vi.fn(() => new Promise<Array<{ _id: string }>>((resolve) => {
        resolveInitialFetch = resolve
      })),
    }
    const harness = createHarness({
      client: {
        onUpdate: vi.fn((_query, _args, onResult, onError) => {
          listeners.push({ onResult, onError })
          return () => {}
        }),
      },
      httpClient,
    })
    const args = ref({ userId: '1' })
    const state = harness.run(() => useConvexQuery(queryRef, args))

    const staleFetch = state.suspense()

    args.value = { userId: '2' }
    await nextTick()

    listeners[1].onResult([{ _id: 'task-live' }])
    await nextTick()

    expect(resolveInitialFetch).toBeTypeOf('function')
    resolveInitialFetch!([{ _id: 'task-stale' }])
    await expect(staleFetch).resolves.toEqual([{ _id: 'task-stale' }])
    expect(state.data.value).toEqual([{ _id: 'task-live' }])

    harness.stop()
  })

  it('keeps server-disabled queries pending during SSR until the client can subscribe', () => {
    vi.stubGlobal('window', undefined)

    const harness = createHarness({ httpClient: { query: vi.fn() } })
    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }, { server: false }))

    expect(state.isPending.value).toBe(true)

    harness.stop()
  })

  it('runs mutations and actions with Vue-native pending state', async () => {
    const client = {
      mutation: vi.fn(async () => 'created-id'),
      action: vi.fn(async () => 'done'),
    }
    const harness = createHarness({ client })

    const mutation = harness.run(() => useConvexMutation(mutationRef))
    const action = harness.run(() => useConvexAction(actionRef))

    await expect(mutation.mutate({ title: 'Task' })).resolves.toBe('created-id')
    await expect(action.execute({ title: 'Task' })).resolves.toBe('done')
    expect(mutation.isPending.value).toBe(false)
    expect(action.isPending.value).toBe(false)

    harness.stop()
  })

  it('recreates paginated suspense after reset', async () => {
    const harness = createHarness({
      client: {
        onUpdate: vi.fn((_query, _args, onResult, onError) => {
          listeners.push({ onResult, onError })
          return () => {}
        }),
      },
    })

    const pagination = harness.run(() => useConvexPaginatedQuery(paginatedRef, {}, { numItems: 2 }))

    listeners[0].onResult({
      page: [{ _id: 'page-1' }],
      continueCursor: 'cursor-1',
      isDone: false,
    } satisfies PaginationResult<{ _id: string }>)

    await expect(pagination.suspense()).resolves.toEqual([[{ _id: 'page-1' }]])

    pagination.reset()
    await nextTick()
    listeners[1].onResult({
      page: [{ _id: 'page-2' }],
      continueCursor: '',
      isDone: true,
    } satisfies PaginationResult<{ _id: string }>)

    await expect(pagination.suspense()).resolves.toEqual([[{ _id: 'page-2' }]])
    harness.stop()
  })

  it('provides zero-argument storage helpers and uploads through them', async () => {
    const client = {
      mutation: vi.fn(async (ref: { _name: string }, args: Record<string, string>) => {
        if (ref._name.endsWith('generateUploadUrl'))
          return 'https://upload.convex.dev'
        if (ref._name.endsWith('remove'))
          return undefined
        throw new Error(`Unhandled mutation: ${ref._name} ${JSON.stringify(args)}`)
      }),
      onUpdate: vi.fn((_query, _args, onResult, onError) => {
        listeners.push({ onResult, onError })
        return () => {}
      }),
    }

    const harness = createHarness({ client, storage: storageRefs })
    const storage = harness.run(() => useConvexStorage())

    await expect(storage.generateUploadUrl()).resolves.toBe('https://upload.convex.dev')

    const fileUrl = harness.run(() => storage.getUrl('storage-1'))
    listeners[0].onResult('https://cdn.convex.dev/file.png')
    await nextTick()
    expect(fileUrl.value).toBe('https://cdn.convex.dev/file.png')

    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ storageId: 'storage-1' }),
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

  it('does not require a realtime client just to create storage helpers during SSR', async () => {
    vi.stubGlobal('window', undefined)

    const harness = createHarness({ storage: storageRefs })
    const storage = harness.run(() => useConvexStorage())
    const fileUrl = harness.run(() => storage.getUrl('storage-1'))

    expect(fileUrl.value).toBeNull()
    await expect(storage.generateUploadUrl()).rejects.toThrow('[convex-vue] Convex client is not initialized')

    harness.stop()
  })

  it('re-subscribes storage urls after deferred client init', async () => {
    const deferredClient = {
      onUpdate: vi.fn((_query, _args, onResult, onError) => {
        listeners.push({ onResult, onError })
        return () => {}
      }),
    }
    const harness = createHarness({ storage: storageRefs })
    const storage = harness.run(() => useConvexStorage())
    const fileUrl = harness.run(() => storage.getUrl('storage-1'))

    expect(fileUrl.value).toBeNull()

    harness.context.clientRef.value = deferredClient as unknown as ConvexVueContext['clientRef']['value']
    await nextTick()

    listeners[0].onResult('https://cdn.convex.dev/deferred.png')
    await nextTick()

    expect(fileUrl.value).toBe('https://cdn.convex.dev/deferred.png')

    harness.stop()
  })
})
