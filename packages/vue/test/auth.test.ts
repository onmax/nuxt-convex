import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createHarness,
  emitAuthState,
  getLastRealtimeClient,
  resetClients,
} from './helpers/runtimeHarness'

const root = await import('../src/index')

describe('useConvexAuth', () => {
  beforeEach(() => {
    resetClients()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('re-applies auth and clears state across reconnects', () => {
    const fetchToken = vi.fn(async () => 'token')
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })

    const auth = harness.run(() => root.useConvexAuth({ fetchToken }))
    const initialClient = getLastRealtimeClient()

    expect(initialClient.setAuth).toHaveBeenCalledTimes(1)
    expect(auth.isLoading.value).toBe(true)
    expect(auth.isAuthenticated.value).toBe(false)

    emitAuthState(initialClient, true)
    expect(auth.isLoading.value).toBe(false)
    expect(auth.isAuthenticated.value).toBe(true)

    harness.controller.disconnect()

    expect(auth.isLoading.value).toBe(false)
    expect(auth.isAuthenticated.value).toBe(false)

    harness.controller.connect({ url: 'https://reconnected.convex.cloud' })

    const reconnectedClient = getLastRealtimeClient()
    expect(reconnectedClient).not.toBe(initialClient)
    expect(reconnectedClient.setAuth).toHaveBeenCalledTimes(1)
    expect(auth.isLoading.value).toBe(true)
    expect(auth.isAuthenticated.value).toBe(false)

    emitAuthState(reconnectedClient, false)
    expect(auth.isLoading.value).toBe(false)
    expect(auth.isAuthenticated.value).toBe(false)

    harness.stop()
  })

  it('ignores stale auth callbacks from a disconnected client', () => {
    const fetchToken = vi.fn(async () => 'token')
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })
    const auth = harness.run(() => root.useConvexAuth({ fetchToken }))
    const initialClient = getLastRealtimeClient()

    harness.controller.connect({ url: 'https://next.convex.cloud' })
    const nextClient = getLastRealtimeClient()

    emitAuthState(initialClient, true)
    expect(auth.isAuthenticated.value).toBe(false)

    emitAuthState(nextClient, true)
    expect(auth.isLoading.value).toBe(false)
    expect(auth.isAuthenticated.value).toBe(true)

    harness.stop()
  })
})
