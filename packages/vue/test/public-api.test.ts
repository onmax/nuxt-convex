import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import {
  actionRef,
  createHarness,
  getLastHttpClient,
  getLastRealtimeClient,
  mutationRef,
  queryRef,
  resetClients,
  storageRefs,
} from './helpers/runtimeHarness'

const advanced = await import('../src/advanced')
const root = await import('../src/index')
const storage = await import('../src/storage')

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
    const controller = advanced.createConvexVueController()

    expect(controller.status.value).toBe('disconnected')
    expect(controller.getClient()).toBeUndefined()
    expect(controller.getHttpClient()).toBeUndefined()

    controller.connect({ url: 'https://test.convex.cloud' })

    expect(controller.status.value).toBe('connected')
    expect(controller.getHttpClient()).toBeTruthy()
  })

  it('exposes raw clients through the advanced entrypoint', () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })

    expect(harness.run(() => advanced.useConvexClient())).toBe(getLastRealtimeClient())
    expect(harness.run(() => advanced.useConvexHttpClient())).toBe(getLastHttpClient())

    harness.stop()
  })

  it('throws clear advanced errors when raw clients are unavailable', () => {
    const harness = createHarness()

    expect(() => harness.run(() => advanced.useConvexClient())).toThrow(
      '[convex-vue/advanced] Convex realtime client is not connected. Use useConvexController() to connect first.',
    )
    expect(() => harness.run(() => advanced.useConvexHttpClient())).toThrow(
      '[convex-vue/advanced] Convex HTTP client is not connected. Use useConvexController() to connect first.',
    )

    harness.stop()
  })

  it('reconfigures and disconnects the advanced controller', () => {
    const controller = advanced.createConvexVueController({ url: 'https://initial.convex.cloud' })

    controller.reconfigure({ url: 'https://next.convex.cloud', server: false })

    expect(controller.options.value.url).toBe('https://next.convex.cloud')
    expect(controller.options.value.server).toBe(false)

    controller.disconnect()

    expect(controller.status.value).toBe('disconnected')
    expect(controller.options.value.url).toBeUndefined()
    expect(controller.getClient()).toBeUndefined()
    expect(controller.getHttpClient()).toBeUndefined()
  })

  it('keeps read helpers wired through the public entrypoints', async () => {
    const harness = createHarness({
      options: { url: 'https://test.convex.cloud' },
      storageOptions: storageRefs,
    })
    const client = getLastRealtimeClient()

    const query = harness.run(() => root.useConvexQuery(queryRef, { userId: '1' }))
    const queries = harness.run(() => root.useConvexQueries({
      list: { query: queryRef, args: { userId: '1' } },
    }))
    const pagination = harness.run(() => root.useConvexPaginatedQuery(queryRef, 'skip', { numItems: 2 }))
    const connection = harness.run(() => root.useConvexConnectionState())
    const fileUrl = harness.run(() => storage.useConvexStorage().getUrl('storage-1'))

    client.listeners[0].onResult([{ _id: 'task-1' }])
    client.listeners[1].onResult([{ _id: 'task-2' }])
    client.listeners[2].onResult('https://cdn.convex.dev/file.png')
    await nextTick()

    expect(query.data.value).toEqual([{ _id: 'task-1' }])
    expect(queries.data.value.list).toEqual([{ _id: 'task-2' }])
    expect(pagination.isSkipped.value).toBe(true)
    expect(connection.isConnected.value).toBe(false)
    expect(fileUrl.value).toBe('https://cdn.convex.dev/file.png')

    harness.stop()
  })

  it('runs mutations and actions with Vue-native pending state', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const client = getLastRealtimeClient()
    client.mutation.mockResolvedValue('created-id')
    client.action.mockResolvedValue('done')

    const mutation = harness.run(() => root.useConvexMutation(mutationRef))
    const action = harness.run(() => root.useConvexAction(actionRef))

    await expect(mutation.mutate({ title: 'Task' })).resolves.toBe('created-id')
    await expect(action.execute({ title: 'Task' })).resolves.toBe('done')
    expect(mutation.isPending.value).toBe(false)
    expect(action.isPending.value).toBe(false)

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

    const storageState = harness.run(() => storage.useConvexStorage())
    await expect(storageState.generateUploadUrl()).resolves.toBe('https://upload.convex.dev')

    originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn(async () => ({
      json: async () => ({ storageId: 'storage-1' }),
      ok: true,
      status: 200,
      statusText: 'OK',
    })) as unknown as typeof fetch

    const upload = harness.run(() => storage.useConvexUpload())
    const file = new globalThis.File(['hello'], 'hello.txt', { type: 'text/plain' })

    await expect(upload.upload(file)).resolves.toBe('storage-1')
    await expect(storageState.remove('storage-1')).resolves.toBeUndefined()
    expect(client.mutation).toHaveBeenCalledWith(storageRefs.remove, { storageId: 'storage-1' })

    harness.stop()
  })

  it('requires the /storage feature to be installed before using storage helpers', () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })

    expect(() => harness.run(() => storage.useConvexStorage())).toThrow(
      '[convex-vue/storage] Storage feature is not configured. Install convexVueStorage first.',
    )

    harness.stop()
  })
})
