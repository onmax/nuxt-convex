import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  actionRef,
  createHarness,
  getLastHttpClient,
  getLastRealtimeClient,
  httpClients,
  mutationRef,
  noArgsMutationRef,
  queryRef,
  resetClients,
  storageRefs,
} from './helpers/runtimeHarness'

/** Answers every XHR upload with `response`, reporting progress halfway through. */
function stubUpload(response: { status: number, statusText?: string, body?: unknown }): { requests: Array<{ url: string, headers: Record<string, string>, body: unknown }> } {
  const requests: Array<{ url: string, headers: Record<string, string>, body: unknown }> = []
  class FakeXhr {
    status = 0
    statusText = ''
    responseText = ''
    upload: { onprogress?: (event: { loaded: number, total: number, lengthComputable: boolean }) => void } = {}
    onload?: () => void
    onerror?: () => void
    onabort?: () => void
    private request = { url: '', headers: {} as Record<string, string>, body: undefined as unknown }
    open(_method: string, url: string): void {
      this.request.url = url
    }

    setRequestHeader(name: string, value: string): void {
      this.request.headers[name] = value
    }

    abort(): void {
      queueMicrotask(() => this.onabort?.())
    }

    send(body: unknown): void {
      this.request.body = body
      requests.push(this.request)
      queueMicrotask(() => {
        this.upload.onprogress?.({ loaded: 1, total: 2, lengthComputable: true })
        this.status = response.status
        this.statusText = response.statusText ?? ''
        this.responseText = JSON.stringify(response.body ?? {})
        this.onload?.()
      })
    }
  }
  vi.stubGlobal('XMLHttpRequest', FakeXhr)
  return { requests }
}

const advanced = await import('../src/advanced')
const root = await import('../src/index')
const storage = await import('../src/storage')

describe('vue-convex public API', () => {
  beforeEach(() => {
    resetClients()
  })

  afterEach(() => {
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
    expect(httpClients).toHaveLength(0)
    expect(controller.getHttpClient()).toBeTruthy()
  })

  it('closes the realtime client when the app unmounts', () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const client = getLastRealtimeClient()
    harness.app.mount(document.createElement('div'))

    harness.app.unmount()

    expect(client.close).toHaveBeenCalledTimes(1)
    expect(harness.controller.getClient()).toBeUndefined()
  })

  it('explains where composables can be called', () => {
    expect(() => root.useConvexQuery(queryRef, { userId: '1' })).toThrow('must be called inside setup()')
  })

  it('exposes raw clients through the advanced entrypoint', () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })

    expect(harness.run(() => advanced.useConvexClient())).toBe(getLastRealtimeClient())
    expect(httpClients).toHaveLength(0)
    expect(harness.run(() => advanced.useConvexHttpClient())).toBe(getLastHttpClient())

    harness.stop()
  })

  it('throws clear advanced errors when raw clients are unavailable', () => {
    const harness = createHarness()

    expect(() => harness.run(() => advanced.useConvexClient())).toThrow(
      '[vue-convex/advanced] Convex realtime client is not connected. Use useConvexController() to connect first.',
    )
    expect(() => harness.run(() => advanced.useConvexHttpClient())).toThrow(
      '[vue-convex/advanced] Convex HTTP client is not connected. Use useConvexController() to connect first.',
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

  it('replaces the realtime client when connecting again', () => {
    const controller = advanced.createConvexVueController({ url: 'https://initial.convex.cloud' })
    const initialClient = getLastRealtimeClient()

    controller.connect({ url: 'https://next.convex.cloud' })

    const nextClient = getLastRealtimeClient()
    expect(nextClient).not.toBe(initialClient)
    expect(initialClient.close).toHaveBeenCalledTimes(1)

    controller.disconnect()
    expect(nextClient.close).toHaveBeenCalledTimes(1)
  })

  it('runs mutations and actions with Vue-native pending state', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const client = getLastRealtimeClient()
    const mutationResult = Promise.withResolvers<string>()
    const actionResult = Promise.withResolvers<string>()
    client.mutation.mockResolvedValue('cleared').mockReturnValueOnce(mutationResult.promise)
    client.action.mockReturnValueOnce(actionResult.promise)

    const mutation = harness.run(() => root.useConvexMutation(mutationRef))
    const noArgs = harness.run(() => root.useConvexMutation(noArgsMutationRef))
    const action = harness.run(() => root.useConvexAction(actionRef))

    expect(mutation.isPending.value).toBe(false)
    expect(action.isPending.value).toBe(false)

    const mutating = mutation.mutate({ title: 'Task' })
    const executing = action.execute({ title: 'Task' })
    expect(mutation.isPending.value).toBe(true)
    expect(action.isPending.value).toBe(true)

    mutationResult.resolve('created-id')
    await expect(mutating).resolves.toBe('created-id')
    expect(mutation.isPending.value).toBe(false)
    expect(action.isPending.value).toBe(true)

    actionResult.resolve('done')
    await expect(executing).resolves.toBe('done')
    expect(action.isPending.value).toBe(false)

    await expect(noArgs.mutate()).resolves.toBe('cleared')
    expect(client.mutation).toHaveBeenLastCalledWith(noArgsMutationRef, {}, undefined)

    harness.stop()
  })

  it('configures storage through the /storage feature entrypoint', async () => {
    const harness = createHarness({
      options: { url: 'https://test.convex.cloud' },
      storageOptions: storageRefs,
    })
    const client = getLastRealtimeClient()
    client.mutation.mockImplementation(async ref => ref === storageRefs.generateUploadUrl ? 'https://upload.convex.dev' : undefined)

    const storageState = harness.run(() => storage.useConvexStorage())
    await expect(storageState.generateUploadUrl()).resolves.toBe('https://upload.convex.dev')

    const { requests } = stubUpload({ status: 200, body: { storageId: 'storage-1' } })
    const onProgress = vi.fn()
    const upload = harness.run(() => storage.useConvexUpload({ onProgress }))
    const file = new globalThis.File(['hello'], 'hello.bin')

    await expect(upload.upload(file)).resolves.toBe('storage-1')
    expect(requests[0].headers['Content-Type']).toBe('application/octet-stream')
    expect(onProgress).toHaveBeenCalledWith({ loaded: 1, total: 2 })
    await expect(storageState.remove('storage-1')).resolves.toBeUndefined()
    expect(client.mutation).toHaveBeenCalledWith(storageRefs.remove, { storageId: 'storage-1' })

    harness.stop()
  })

  it('requires the /storage feature to be installed before using storage helpers', () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })

    expect(() => harness.run(() => storage.useConvexStorage())).toThrow(
      '[vue-convex/storage] Storage feature is not configured. Install convexVueStorage first.',
    )

    harness.stop()
  })

  it('returns null and reports an error when upload url generation fails', async () => {
    const onError = vi.fn()
    const harness = createHarness({
      options: { url: 'https://test.convex.cloud' },
      storageOptions: storageRefs,
    })
    const client = getLastRealtimeClient()
    client.mutation.mockRejectedValueOnce(new Error('missing upload url'))

    const upload = harness.run(() => storage.useConvexUpload({ onError }))
    const file = new globalThis.File(['hello'], 'hello.txt', { type: 'text/plain' })

    await expect(upload.upload(file)).resolves.toBeNull()
    expect(upload.error.value?.message).toBe('missing upload url')
    expect(onError).toHaveBeenCalledTimes(1)

    harness.stop()
  })

  it.each([
    {
      failure: 'the upload response is invalid',
      response: { status: 200, body: {} },
      message: '[vue-convex/storage] Upload response did not include a storageId',
    },
    {
      failure: 'the upload request fails',
      response: { status: 500, statusText: 'Server Error' },
      message: '[vue-convex/storage] Upload failed: 500 Server Error',
    },
  ])('returns null and reports an error when $failure', async ({ response, message }) => {
    const onError = vi.fn()
    const harness = createHarness({
      options: { url: 'https://test.convex.cloud' },
      storageOptions: storageRefs,
    })
    const client = getLastRealtimeClient()
    client.mutation.mockResolvedValue('https://upload.convex.dev')

    stubUpload(response)

    const upload = harness.run(() => storage.useConvexUpload({ onError }))
    const file = new globalThis.File(['hello'], 'hello.txt', { type: 'text/plain' })

    await expect(upload.upload(file)).resolves.toBeNull()
    expect(upload.error.value?.message).toBe(message)
    expect(onError).toHaveBeenCalledTimes(1)

    harness.stop()
  })

  it('awaits the upload success callback before resolving', async () => {
    const callbackStarted = Promise.withResolvers<void>()
    const callbackFinished = Promise.withResolvers<void>()
    const onSuccess = vi.fn(() => {
      callbackStarted.resolve()
      return callbackFinished.promise
    })
    const harness = createHarness({
      options: { url: 'https://test.convex.cloud' },
      storageOptions: storageRefs,
    })
    const client = getLastRealtimeClient()
    client.mutation.mockResolvedValue('https://upload.convex.dev')

    stubUpload({ status: 200, body: { storageId: 'storage-1' } })

    const upload = harness.run(() => storage.useConvexUpload({ onSuccess }))
    const file = new globalThis.File(['hello'], 'hello.txt', { type: 'text/plain' })

    let resolved = false
    const uploading = upload.upload(file).then((storageId) => {
      resolved = true
      return storageId
    })
    await callbackStarted.promise
    await Promise.resolve()

    expect(onSuccess).toHaveBeenCalledWith('storage-1', file)
    expect(resolved).toBe(false)
    expect(upload.isUploading.value).toBe(true)
    expect(upload.progress.value).toBe(100)

    callbackFinished.resolve()
    await expect(uploading).resolves.toBe('storage-1')
    expect(upload.isUploading.value).toBe(false)

    harness.stop()
  })

  it('aborts uploads through an AbortSignal', async () => {
    const harness = createHarness({
      options: { url: 'https://test.convex.cloud' },
      storageOptions: storageRefs,
    })
    getLastRealtimeClient().mutation.mockResolvedValue('https://upload.convex.dev')
    const { requests } = stubUpload({ status: 200, body: { storageId: 'storage-1' } })
    const controller = new AbortController()
    controller.abort()

    const upload = harness.run(() => storage.useConvexUpload())
    await expect(upload.upload(new globalThis.File(['hello'], 'hello.txt'), { signal: controller.signal })).resolves.toBeNull()
    expect(upload.error.value?.name).toBe('AbortError')
    expect(requests).toHaveLength(0)

    harness.stop()
  })
})
