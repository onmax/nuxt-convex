import type { PaginationResult } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref } from 'vue'
import {
  createHarness,
  emitConnectionState,
  getLastHttpClient,
  getLastRealtimeClient,
  paginatedRef,
  queryRef,
  resetClients,
  secondQueryRef,
  storageRefs,
} from './helpers/runtimeHarness'

describe('internal runtime facade', () => {
  beforeEach(() => {
    resetClients()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('handles query subscription success and realtime errors', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const client = getLastRealtimeClient()

    const state = harness.run(() => harness.facade.query(queryRef, { userId: '1' }))

    expect(state.isPending.value).toBe(true)
    client.listeners[0].onResult([{ _id: 'task-1' }])
    await nextTick()
    expect(state.data.value).toEqual([{ _id: 'task-1' }])
    expect(state.error.value).toBeNull()

    const failure = new Error('subscription failed')
    client.listeners[0].onError(failure)
    await nextTick()
    expect(state.data.value).toBeUndefined()
    expect(state.error.value).toEqual(failure)

    harness.stop()
  })

  it('uses the http client when suspense waits for an initial query result', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const httpClient = getLastHttpClient()
    httpClient.query.mockResolvedValue([{ _id: 'task-http' }])

    const state = harness.run(() => harness.facade.query(queryRef, { userId: '1' }))

    await expect(state.suspense()).resolves.toEqual([{ _id: 'task-http' }])
    expect(httpClient.query).toHaveBeenCalledWith(queryRef, { userId: '1' })
    expect(state.data.value).toEqual([{ _id: 'task-http' }])

    harness.stop()
  })

  it('does not let stale http suspense overwrite newer live query data', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const client = getLastRealtimeClient()
    const httpClient = getLastHttpClient()
    let resolveInitialFetch: ((value: Array<{ _id: string }>) => void) | null = null
    httpClient.query.mockImplementation(() => new Promise<Array<{ _id: string }>>((resolve) => {
      resolveInitialFetch = resolve
    }))

    const args = ref({ userId: '1' })
    const state = harness.run(() => harness.facade.query(queryRef, args))

    const staleFetch = state.suspense()

    args.value = { userId: '2' }
    await nextTick()

    client.listeners.at(-1)!.onResult([{ _id: 'task-live' }])
    await nextTick()

    resolveInitialFetch!([{ _id: 'task-stale' }])
    await expect(staleFetch).resolves.toEqual([{ _id: 'task-stale' }])
    expect(state.data.value).toEqual([{ _id: 'task-live' }])

    harness.stop()
  })

  it('waits for a later controller connection before resolving query suspense', async () => {
    const harness = createHarness()
    const state = harness.run(() => harness.facade.query(queryRef, { userId: '1' }))

    const pending = state.suspense()
    harness.controller.connect({ url: 'https://late.convex.cloud' })
    await nextTick()

    const client = getLastRealtimeClient()
    client.listeners[0].onResult([{ _id: 'task-connected' }])

    await expect(pending).resolves.toEqual([{ _id: 'task-connected' }])
    expect(state.data.value).toEqual([{ _id: 'task-connected' }])

    harness.stop()
  })

  it('tracks keyed query subscriptions through one boundary', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const queriesRef = ref({
      list: { query: queryRef, args: { userId: '1' } },
      detail: { query: secondQueryRef, args: 'skip' as const },
    })

    const state = harness.run(() => harness.facade.queries(queriesRef))
    const client = getLastRealtimeClient()

    client.listeners[0].onResult([{ _id: 'task-1' }])
    await nextTick()
    expect(state.data.value.list).toEqual([{ _id: 'task-1' }])
    expect(state.data.value.detail).toBeUndefined()

    queriesRef.value = {
      list: { query: queryRef, args: { userId: '2' } },
      detail: { query: secondQueryRef, args: { id: 'task-2' } },
    }
    await nextTick()

    client.listeners.at(-2)!.onResult([{ _id: 'task-2' }])
    client.listeners.at(-1)!.onResult({ _id: 'task-2' })
    await nextTick()

    expect(state.data.value.list).toEqual([{ _id: 'task-2' }])
    expect(state.data.value.detail).toEqual({ _id: 'task-2' })

    harness.stop()
  })

  it('recreates paginated suspense after reset', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const client = getLastRealtimeClient()
    const pagination = harness.run(() => harness.facade.pagination(paginatedRef, {}, { numItems: 2 }))

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

  it('re-subscribes connection state and live storage values after reconnect', async () => {
    const harness = createHarness({
      options: { url: 'https://test.convex.cloud' },
      storageOptions: storageRefs,
    })
    const connection = harness.run(() => harness.facade.connection())
    const fileUrl = harness.run(() => harness.facade.liveValue(storageRefs.getUrl, computed(() => ({ storageId: 'storage-1' })), null))
    const initialClient = getLastRealtimeClient()

    emitConnectionState(initialClient, { isWebSocketConnected: true })
    initialClient.listeners[0].onResult('https://cdn.convex.dev/initial.png')
    await nextTick()
    expect(connection.isConnected.value).toBe(true)
    expect(fileUrl.value).toBe('https://cdn.convex.dev/initial.png')

    harness.controller.disconnect()
    await nextTick()
    expect(connection.state.value).toBeNull()
    expect(fileUrl.value).toBeNull()

    harness.controller.connect({ url: 'https://test.convex.cloud' })
    await nextTick()

    const reconnectedClient = getLastRealtimeClient()
    emitConnectionState(reconnectedClient, { isWebSocketConnected: true })
    reconnectedClient.listeners[0].onResult('https://cdn.convex.dev/reconnected.png')
    await nextTick()
    expect(connection.isConnected.value).toBe(true)
    expect(fileUrl.value).toBe('https://cdn.convex.dev/reconnected.png')

    harness.stop()
  })

  it('clears skipped query and pagination state consistently', async () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const queryArgs = ref<{ userId: string } | 'skip'>({ userId: '1' })
    const paginationArgs = ref<{ userId: string } | 'skip'>({ userId: '1' })
    const query = harness.run(() => harness.facade.query(queryRef, queryArgs))
    const pagination = harness.run(() => harness.facade.pagination(paginatedRef, paginationArgs, { numItems: 2 }))
    const client = getLastRealtimeClient()

    client.listeners[0].onResult([{ _id: 'task-1' }])
    client.listeners[1].onResult({
      continueCursor: null,
      isDone: true,
      page: [{ _id: 'page-1' }],
    } satisfies PaginationResult<{ _id: string }>)
    await nextTick()

    queryArgs.value = 'skip'
    paginationArgs.value = 'skip'
    await nextTick()

    expect(query.isSkipped.value).toBe(true)
    expect(query.data.value).toBeUndefined()
    expect(pagination.isSkipped.value).toBe(true)
    expect(pagination.data.value).toEqual([])

    harness.stop()
  })
})
