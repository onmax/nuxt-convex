import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref } from 'vue'
import {
  alternateQueryRef,
  createHarness,
  emitAuthState,
  emitConnectionState,
  getLastHttpClient,
  getLastRealtimeClient,
  queryRef,
  resetClients,
  secondQueryRef,
  storageRefs,
} from './helpers/runtimeHarness'

const { isConvexError, useConvexAuth, useConvexConnectionState, useConvexQueries, useConvexQuery } = await import('../src/index')
const { useConvexStorage } = await import('../src/storage')

const url = 'https://test.convex.cloud'

describe('useConvexQuery', () => {
  beforeEach(() => {
    resetClients()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('tracks results and realtime errors through status', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))

    expect(state.status.value).toBe('pending')
    expect(state.isPending.value).toBe(true)

    client.listeners[0].onResult([{ _id: 'task-1' }])
    expect(state.status.value).toBe('success')
    expect(state.data.value).toEqual([{ _id: 'task-1' }])

    const failure = new ConvexError({ code: 'NOT_FOUND' })
    client.listeners[0].onError(failure)
    expect(state.status.value).toBe('error')
    expect(state.data.value).toBeUndefined()
    expect(isConvexError(state.error.value, 'NOT_FOUND')).toBe(true)
    expect(isConvexError(state.error.value, 'OTHER')).toBe(false)

    harness.stop()
  })

  it('waits for the WebSocket on the client and never fetches over HTTP', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))

    const awaited = Promise.resolve(state)
    const suspended = state.suspense()
    client.listeners[0].onResult([{ _id: 'task-live' }])

    const { data, status } = await awaited
    expect(status.value).toBe('success')
    expect(data.value).toEqual([{ _id: 'task-live' }])
    await expect(suspended).resolves.toEqual([{ _id: 'task-live' }])
    expect(getLastHttpClient).toThrow()

    harness.stop()
  })

  it('keeps live data when an older result arrives after an args change', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const args = ref({ userId: '1' })
    const state = harness.run(() => useConvexQuery(queryRef, args))
    const staleListener = client.listeners[0]

    args.value = { userId: '2' }
    await nextTick()

    client.listeners.at(-1)!.onResult([{ _id: 'task-live' }])
    staleListener.onResult([{ _id: 'task-stale' }])
    expect(state.data.value).toEqual([{ _id: 'task-live' }])

    harness.stop()
  })

  it('awaiting never rejects, while suspense() does', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))
    const suspended = state.suspense()

    client.listeners[0].onError(new Error('boom'))

    const { error, status } = await state
    expect(status.value).toBe('error')
    expect(error.value?.message).toBe('boom')
    await expect(suspended).rejects.toThrow('boom')

    harness.stop()
  })

  it('settles pending awaits when its scope is disposed', async () => {
    const harness = createHarness({ options: { url } })
    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))
    const awaited = Promise.resolve(state)

    harness.stop()
    const { status } = await awaited
    expect(status.value).toBe('pending')
    expect(getLastRealtimeClient().listeners).toHaveLength(0)
  })

  it('waits for a later controller connection', async () => {
    const harness = createHarness()
    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))

    const pending = state.suspense()
    harness.controller.connect({ url: 'https://late.convex.cloud' })
    await nextTick()

    getLastRealtimeClient().listeners[0].onResult([{ _id: 'task-connected' }])
    await expect(pending).resolves.toEqual([{ _id: 'task-connected' }])

    harness.stop()
  })

  it('resets data when args change, unless keepPreviousData is set', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const args = ref({ userId: '1' })
    const reset = harness.run(() => useConvexQuery(queryRef, args))
    const kept = harness.run(() => useConvexQuery(queryRef, args, { keepPreviousData: true }))

    for (const listener of client.listeners)
      listener.onResult([{ _id: 'user-1' }])

    args.value = { userId: '2' }
    await nextTick()

    expect(reset.data.value).toBeUndefined()
    expect(reset.status.value).toBe('pending')
    expect(kept.data.value).toEqual([{ _id: 'user-1' }])
    expect(kept.status.value).toBe('pending')

    harness.stop()
  })

  it('does not resubscribe for deep-equal args and subscribes before unsubscribing', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const subscribe = client.onUpdate.getMockImplementation() as (...args: unknown[]) => () => void
    const log: string[] = []
    client.onUpdate.mockImplementation((query, args, onResult, onError) => {
      log.push(`subscribe:${args.userId}`)
      const unsubscribe = subscribe(query, args, onResult, onError)
      return () => {
        log.push(`unsubscribe:${args.userId}`)
        unsubscribe()
      }
    })
    const userId = ref('1')
    const unrelated = ref(0)
    harness.run(() => useConvexQuery(queryRef, () => ({ userId: userId.value, ...(unrelated.value < 0 ? { extra: 1 } : {}) })))

    unrelated.value++
    await nextTick()
    expect(log).toEqual(['subscribe:1'])

    userId.value = '2'
    await nextTick()
    expect(log).toEqual(['subscribe:1', 'subscribe:2', 'unsubscribe:1'])

    harness.stop()
  })

  it('keys args with convexToJson, so bigint and bytes args work', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const args = ref<Record<string, unknown>>({ n: 1n, bytes: new Uint8Array([1]).buffer })
    const state = harness.run(() => useConvexQuery(queryRef, args as never))

    expect(state.error.value).toBeNull()
    args.value = { n: 1n, bytes: new Uint8Array([1]).buffer }
    await nextTick()
    expect(client.onUpdate).toHaveBeenCalledTimes(1)

    args.value = { n: 1n, bytes: new Uint8Array([2]).buffer }
    await nextTick()
    args.value = { n: 2n, bytes: new Uint8Array([2]).buffer }
    await nextTick()
    expect(client.onUpdate).toHaveBeenCalledTimes(3)

    harness.stop()
  })

  it('surfaces args Convex cannot serialize as an error', async () => {
    const harness = createHarness({ options: { url } })
    const state = harness.run(() => useConvexQuery(queryRef, { userId: new Date() } as never))

    expect(state.status.value).toBe('error')
    expect(state.error.value).toBeInstanceOf(Error)
    expect(getLastRealtimeClient().onUpdate).not.toHaveBeenCalled()
    await expect(Promise.resolve(state)).resolves.toBeTruthy()

    harness.stop()
  })

  it('forwards errors thrown while subscribing', () => {
    const harness = createHarness({ options: { url } })
    getLastRealtimeClient().onUpdate.mockImplementationOnce(() => {
      throw new Error('cannot subscribe')
    })
    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))

    expect(state.status.value).toBe('error')
    expect(state.error.value?.message).toBe('cannot subscribe')

    harness.stop()
  })

  it('keeps auth-required queries idle until authenticated', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    harness.run(() => useConvexAuth({ fetchToken: async () => 'token' }))
    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }, { auth: 'required' }))

    expect(state.status.value).toBe('idle')
    expect(state.isSkipped.value).toBe(true)
    expect(client.onUpdate).not.toHaveBeenCalled()
    await expect(Promise.resolve(state)).resolves.toBeTruthy()

    emitAuthState(client, true)
    await nextTick()
    expect(state.status.value).toBe('pending')
    expect(client.listeners).toHaveLength(1)

    harness.stop()
  })

  it('clears skipped queries', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const args = ref<{ userId: string } | 'skip'>({ userId: '1' })
    const state = harness.run(() => useConvexQuery(queryRef, args))

    client.listeners[0].onResult([{ _id: 'task-1' }])
    args.value = 'skip'
    await nextTick()

    expect(state.status.value).toBe('idle')
    expect(state.data.value).toBeUndefined()
    expect(client.listeners).toHaveLength(0)

    harness.stop()
  })

  it('seeds from the realtime client cache', () => {
    const harness = createHarness({ options: { url } })
    getLastRealtimeClient().client.localQueryResult.mockReturnValueOnce([{ _id: 'cached' }])
    const state = harness.run(() => useConvexQuery(queryRef, { userId: '1' }))

    expect(state.status.value).toBe('success')
    expect(state.data.value).toEqual([{ _id: 'cached' }])

    harness.stop()
  })
})

describe('useConvexQueries', () => {
  beforeEach(() => {
    resetClients()
  })

  it('tracks keyed query subscriptions', async () => {
    const harness = createHarness({ options: { url } })
    const queries = ref<{
      list: { query: typeof queryRef, args: { userId: string } }
      detail: { query: typeof secondQueryRef, args: { id: string } | 'skip' }
    }>({
      list: { query: queryRef, args: { userId: '1' } },
      detail: { query: secondQueryRef, args: 'skip' },
    })

    const state = harness.run(() => useConvexQueries(queries))
    const client = getLastRealtimeClient()

    client.listeners[0].onResult([{ _id: 'task-1' }])
    expect(state.data.value.list).toEqual([{ _id: 'task-1' }])
    expect(state.data.value.detail).toBeUndefined()

    queries.value = {
      list: { query: queryRef, args: { userId: '2' } },
      detail: { query: secondQueryRef, args: { id: 'task-2' } },
    }
    await nextTick()

    expect(client.listeners.map(listener => listener.name)).toEqual(['tasks:list', 'tasks:detail'])
    client.listeners[0].onResult([{ _id: 'task-2' }])
    client.listeners[1].onError(new Error('missing'))
    expect(state.data.value.list).toEqual([{ _id: 'task-2' }])
    expect(state.errors.value.detail?.message).toBe('missing')

    harness.stop()
  })

  it('does not resubscribe deep-equal entries and re-subscribes after reconnects', async () => {
    const harness = createHarness({ options: { url } })
    const queries = ref({ list: { query: queryRef as typeof queryRef | typeof alternateQueryRef, args: { userId: '1' } } })
    const state = harness.run(() => useConvexQueries(queries))
    const initialClient = getLastRealtimeClient()

    queries.value = { list: { query: queryRef, args: { userId: '1' } } }
    await nextTick()
    expect(initialClient.onUpdate).toHaveBeenCalledTimes(1)

    queries.value = { list: { query: alternateQueryRef, args: { userId: '1' } } }
    await nextTick()
    initialClient.listeners.at(-1)!.onResult({ total: 4 })
    expect(state.data.value.list).toEqual({ total: 4 })

    harness.controller.connect({ url: 'https://reconnected.convex.cloud' })
    await nextTick()
    getLastRealtimeClient().listeners[0].onResult({ total: 7 })
    expect(state.data.value.list).toEqual({ total: 7 })

    harness.stop()
  })

  it('removes state for removed entries', async () => {
    const harness = createHarness({ options: { url } })
    const queries = ref<Record<string, { query: typeof queryRef | typeof secondQueryRef, args: any }>>({
      list: { query: queryRef, args: { userId: '1' } },
      detail: { query: secondQueryRef, args: { id: 'task-1' } },
    })
    const state = harness.run(() => useConvexQueries(queries))
    const client = getLastRealtimeClient()

    client.listeners[0].onResult([{ _id: 'task-1' }])
    client.listeners[1].onResult({ _id: 'task-1' })
    queries.value = { list: { query: queryRef, args: { userId: '1' } } }
    await nextTick()

    expect(state.data.value.list).toEqual([{ _id: 'task-1' }])
    expect('detail' in state.data.value).toBe(false)
    expect('detail' in state.errors.value).toBe(false)
    expect(client.listeners).toHaveLength(1)

    harness.stop()
  })
})

describe('connection state and storage urls', () => {
  beforeEach(() => {
    resetClients()
  })

  it('re-subscribe after reconnect', async () => {
    const harness = createHarness({ options: { url }, storageOptions: storageRefs })
    const storageId = ref<string | null>('storage-1')
    const connection = harness.run(() => useConvexConnectionState())
    const fileUrl = harness.run(() => useConvexStorage().getUrl(computed(() => storageId.value)))
    const initialClient = getLastRealtimeClient()

    emitConnectionState(initialClient, { isWebSocketConnected: true })
    initialClient.listeners[0].onResult('https://cdn.convex.dev/initial.png')
    expect(connection.isConnected.value).toBe(true)
    expect(fileUrl.value).toBe('https://cdn.convex.dev/initial.png')

    harness.controller.disconnect()
    await nextTick()
    expect(connection.state.value).toBeNull()
    expect(initialClient.listeners).toHaveLength(0)

    harness.controller.connect({ url })
    await nextTick()
    const reconnectedClient = getLastRealtimeClient()
    emitConnectionState(reconnectedClient, { isWebSocketConnected: true })
    reconnectedClient.listeners[0].onResult('https://cdn.convex.dev/reconnected.png')
    expect(connection.isConnected.value).toBe(true)
    expect(fileUrl.value).toBe('https://cdn.convex.dev/reconnected.png')

    storageId.value = null
    await nextTick()
    expect(fileUrl.value).toBeNull()
    expect(reconnectedClient.listeners).toHaveLength(0)

    harness.stop()
  })
})
