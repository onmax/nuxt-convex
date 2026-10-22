import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { createHarness, getLastRealtimeClient, page, paginatedRef, resetClients } from './helpers/runtimeHarness'

const { useConvexPaginatedQuery } = await import('../src/index')

const url = 'https://test.convex.cloud'

describe('useConvexPaginatedQuery', () => {
  beforeEach(() => {
    resetClients()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads the first page, then more pages from the continue cursor', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const pagination = harness.run(() => useConvexPaginatedQuery(paginatedRef, { userId: '1' }, { numItems: 2 }))

    expect(pagination.status.value).toBe('pending')
    expect(client.listeners[0].args).toMatchObject({ userId: '1', paginationOpts: { numItems: 2, cursor: null } })

    client.listeners[0].onResult(page([{ _id: 'a' }, { _id: 'b' }], { continueCursor: 'c1' }))
    const { data, status } = await pagination
    expect(status.value).toBe('success')
    expect(data.value).toEqual([{ _id: 'a' }, { _id: 'b' }])

    expect((pagination.loadMore as (event: unknown) => boolean)(new Event('click'))).toBe(true)
    expect(pagination.isLoadingMore.value).toBe(true)
    expect(client.listeners[1].args.paginationOpts).toMatchObject({ numItems: 2, cursor: 'c1' })

    client.listeners[1].onResult(page([{ _id: 'c' }], { isDone: true }))
    expect(pagination.data.value.map(item => item._id)).toEqual(['a', 'b', 'c'])
    expect(pagination.isDone.value).toBe(true)
    expect(pagination.isLoadingMore.value).toBe(false)

    harness.stop()
  })

  it('guards loadMore while pending, loading, done or skipped', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const args = ref<{ userId: string } | 'skip'>({ userId: '1' })
    const pagination = harness.run(() => useConvexPaginatedQuery(paginatedRef, args, { numItems: 1 }))

    expect(pagination.loadMore()).toBe(false)

    client.listeners[0].onResult(page([{ _id: 'a' }]))
    expect(pagination.loadMore()).toBe(true)
    expect(pagination.loadMore()).toBe(false)
    expect(client.listeners).toHaveLength(2)

    client.listeners[1].onResult(page([{ _id: 'b' }], { isDone: true }))
    expect(pagination.loadMore()).toBe(false)

    args.value = 'skip'
    await nextTick()
    expect(pagination.status.value).toBe('idle')
    expect(pagination.data.value).toEqual([])
    expect(pagination.loadMore()).toBe(false)
    expect(client.listeners).toHaveLength(0)

    harness.stop()
  })

  it('gives every session its own pagination id', () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    harness.run(() => useConvexPaginatedQuery(paginatedRef, { userId: '1' }, { numItems: 2 }))
    harness.run(() => useConvexPaginatedQuery(paginatedRef, { userId: '1' }, { numItems: 2 }))

    const [first, second] = client.listeners.map(listener => listener.args.paginationOpts.id)
    expect(first).toEqual(expect.any(Number))
    expect(second).not.toBe(first)

    harness.stop()
  })

  it('splits pages the server asks to split, and hides incomplete pages', () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const pagination = harness.run(() => useConvexPaginatedQuery(paginatedRef, { userId: '1' }, { numItems: 2 }))

    client.listeners[0].onResult(page([{ _id: 'a' }, { _id: 'b' }, { _id: 'c' }], {
      continueCursor: 'end',
      splitCursor: 'mid',
      pageStatus: 'SplitRequired',
    }))

    expect(pagination.status.value).toBe('pending')
    expect(pagination.data.value).toEqual([])
    const [, left, right] = client.listeners
    expect(left.args.paginationOpts).toMatchObject({ cursor: null, endCursor: 'mid' })
    expect(right.args.paginationOpts).toMatchObject({ cursor: 'mid', endCursor: 'end' })

    left.onResult(page([{ _id: 'a' }, { _id: 'b' }], { continueCursor: 'mid' }))
    right.onResult(page([{ _id: 'c' }], { continueCursor: 'end' }))

    expect(pagination.status.value).toBe('success')
    expect(pagination.data.value.map(item => item._id)).toEqual(['a', 'b', 'c'])
    expect(client.listeners).toEqual([left, right])

    expect(pagination.loadMore()).toBe(true)
    expect(client.listeners.at(-1)!.args.paginationOpts).toMatchObject({ cursor: 'end' })

    harness.stop()
  })

  it('restarts with a new id after an InvalidCursor ConvexError', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const pagination = harness.run(() => useConvexPaginatedQuery(paginatedRef, { userId: '1' }, { numItems: 2 }))
    const firstId = client.listeners[0].args.paginationOpts.id

    client.listeners[0].onError(new ConvexError({ isConvexSystemError: true, paginationError: 'InvalidCursor' }))

    expect(client.listeners).toHaveLength(1)
    expect(client.listeners[0].args.paginationOpts.id).not.toBe(firstId)
    expect(pagination.error.value).toBeNull()

    client.listeners[0].onResult(page([{ _id: 'recovered' }], { isDone: true }))
    expect(pagination.data.value).toEqual([{ _id: 'recovered' }])

    harness.stop()
  })

  it('surfaces other errors without restarting', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const pagination = harness.run(() => useConvexPaginatedQuery(paginatedRef, { userId: '1' }, { numItems: 2 }))
    const suspended = pagination.suspense()

    client.listeners[0].onError(new Error('TooManyReads'))

    const { status, error } = await pagination
    expect(status.value).toBe('error')
    expect(error.value?.message).toBe('TooManyReads')
    await expect(suspended).rejects.toThrow('TooManyReads')
    expect(client.onUpdate).toHaveBeenCalledTimes(1)

    harness.stop()
  })

  it('reset starts a fresh session, and deep-equal args do not', async () => {
    const harness = createHarness({ options: { url } })
    const client = getLastRealtimeClient()
    const args = ref({ userId: '1' })
    const pagination = harness.run(() => useConvexPaginatedQuery(paginatedRef, args, { numItems: 2 }))

    client.listeners[0].onResult(page([{ _id: 'a' }]))
    args.value = { userId: '1' }
    await nextTick()
    expect(client.onUpdate).toHaveBeenCalledTimes(1)

    pagination.reset()
    expect(pagination.status.value).toBe('pending')
    client.listeners[0].onResult(page([{ _id: 'b' }], { isDone: true }))
    await expect(pagination.suspense()).resolves.toEqual([{ _id: 'b' }])

    harness.stop()
  })
})
