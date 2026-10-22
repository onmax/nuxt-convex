import type { Component } from 'vue'
import type { ConvexHydrationAdapter, ConvexVueOptions } from '../src/index'
import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, Suspense } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { asServer, getLastRealtimeClient, httpClients, httpQuery, page, paginatedRef, queryRef, resetClients } from './helpers/runtimeHarness'

const { ConvexAuthenticated, ConvexUnauthenticated, convexVue, isConvexError, useConvexPaginatedQuery, useConvexQuery } = await import('../src/index')

const url = 'https://test.convex.cloud'

/** A payload that goes through JSON, like Nuxt's. */
function createPayload(): { server: ConvexHydrationAdapter, client: ConvexHydrationAdapter, data: Record<string, unknown>, finishHydration: () => void } {
  const data: Record<string, any> = {}
  let isHydrating = true
  return {
    data,
    server: { set: (key, entry) => void (data[key] = JSON.parse(JSON.stringify(entry))), get: () => undefined, isHydrating: () => false },
    client: { set: () => {}, get: key => data[key], isHydrating: () => isHydrating },
    finishHydration: () => {
      isHydrating = false
    },
  }
}

const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve))

function withSuspense(child: Component): Component {
  return defineComponent({ render: () => h(Suspense, null, { default: () => h(child) }) })
}

async function renderOnServer(root: Component, options: ConvexVueOptions): Promise<string> {
  const app = asServer(() => createSSRApp(root).use(convexVue, options))
  return await renderToString(app)
}

/** Hydrates `html` and returns the container plus every hydration warning Vue printed. */
async function hydrate(root: Component, html: string, options: ConvexVueOptions): Promise<{ container: HTMLElement, mismatches: string[] }> {
  const mismatches: string[] = []
  const record = (...args: unknown[]): void => {
    const message = args.map(String).join(' ')
    if (message.includes('Hydration') || message.includes('mismatch'))
      mismatches.push(message)
  }
  vi.spyOn(console, 'warn').mockImplementation(record)
  vi.spyOn(console, 'error').mockImplementation(record)

  const container = document.createElement('div')
  container.innerHTML = html
  createSSRApp(root).use(convexVue, options).mount(container)
  await flush()
  return { container, mismatches }
}

const TaskList = defineComponent({
  async setup() {
    const { data, error, status } = await useConvexQuery(queryRef, { userId: '1' })
    return () => h('div', { 'data-status': status.value }, error.value
      ? `error:${isConvexError(error.value, 'FORBIDDEN') ? 'forbidden' : error.value.message}`
      : data.value?.map(task => task._id).join(','))
  },
})

describe('sSR and hydration', () => {
  beforeEach(() => {
    resetClients()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('awaits queries on the server over HTTP and records them for hydration', async () => {
    const payload = createPayload()
    httpQuery.mockResolvedValue([{ _id: 'task-1' }])

    const html = await renderOnServer(withSuspense(TaskList), { url, hydration: payload.server })

    expect(html).toContain('data-status="success"')
    expect(html).toContain('task-1')
    expect(httpQuery).toHaveBeenCalledWith(queryRef, { userId: '1' }, expect.anything())
    expect(Object.values(payload.data)).toEqual([{ v: [{ _id: 'task-1' }] }])
  })

  it('hydrates without mismatches or client HTTP calls, then follows the WebSocket', async () => {
    const payload = createPayload()
    httpQuery.mockResolvedValue([{ _id: 'task-1' }])
    const root = withSuspense(TaskList)
    const html = await renderOnServer(root, { url, hydration: payload.server })
    const serverCalls = httpQuery.mock.calls.length
    const serverClients = httpClients.length

    const { container, mismatches } = await hydrate(root, html, { url, hydration: payload.client })
    payload.finishHydration()

    expect(mismatches).toEqual([])
    expect(container.innerHTML).toBe(html)
    expect(httpQuery).toHaveBeenCalledTimes(serverCalls)
    expect(httpClients).toHaveLength(serverClients)

    getLastRealtimeClient().listeners[0].onResult([{ _id: 'task-1' }, { _id: 'task-2' }])
    await flush()
    expect(container.textContent).toBe('task-1,task-2')
  })

  it('renders and hydrates query errors instead of failing the render', async () => {
    const payload = createPayload()
    httpQuery.mockRejectedValue(new ConvexError({ code: 'FORBIDDEN' }))
    const root = withSuspense(TaskList)

    const html = await renderOnServer(root, { url, hydration: payload.server })
    expect(html).toContain('error:forbidden')

    const { container, mismatches } = await hydrate(root, html, { url, hydration: payload.client })
    expect(mismatches).toEqual([])
    expect(container.textContent).toBe('error:forbidden')
  })

  it('dedupes identical SSR queries per app', async () => {
    httpQuery.mockResolvedValue([{ _id: 'task-1' }])
    const root = withSuspense(defineComponent({ render: () => [h(TaskList), h(TaskList)] }))

    const html = await renderOnServer(root, { url })

    expect(html.match(/task-1/g)).toHaveLength(2)
    expect(httpQuery).toHaveBeenCalledTimes(1)
  })

  it('round-trips bigint args and values through the payload', async () => {
    const payload = createPayload()
    httpQuery.mockResolvedValue({ count: 2n ** 60n })
    const Counter = defineComponent({
      async setup() {
        const { data } = await useConvexQuery(queryRef, { userId: '1', since: 1n } as never)
        return () => h('span', String((data.value as unknown as { count: bigint } | undefined)?.count))
      },
    })
    const root = withSuspense(Counter)

    const html = await renderOnServer(root, { url, hydration: payload.server })
    const { mismatches } = await hydrate(root, html, { url, hydration: payload.client })

    expect(html).toContain(String(2n ** 60n))
    expect(mismatches).toEqual([])
    expect(getLastRealtimeClient().listeners[0].args).toEqual({ userId: '1', since: 1n })
  })

  it('authenticates SSR queries with serverAuth and keeps auth: none anonymous', async () => {
    const getToken = vi.fn(async () => 'jwt')
    httpQuery.mockImplementation(async (_query, _args, client) => client.setAuth.mock.calls.length ? ['private'] : ['public'])
    const Both = defineComponent({
      async setup() {
        const [mine, everyone] = await Promise.all([
          useConvexQuery(queryRef, { userId: '1' }),
          useConvexQuery(queryRef, { userId: '1' }, { auth: 'none' }),
        ])
        return () => h('p', `${mine.data.value}|${everyone.data.value}`)
      },
    })
    const payload = createPayload()

    const html = await renderOnServer(withSuspense(Both), { url, serverAuth: { getToken }, hydration: payload.server })

    expect(html).toContain('private|public')
    expect(getToken).toHaveBeenCalledTimes(1)
    expect(httpClients.find(client => client.setAuth.mock.calls.length)?.setAuth).toHaveBeenCalledWith('jwt')
    expect(JSON.stringify(payload.data)).not.toContain('jwt')
  })

  it('leaves queries pending on the server unless awaited or enabled', async () => {
    const Lazy = defineComponent({
      async setup() {
        const notAwaited = useConvexQuery(queryRef, { userId: '2' })
        const awaitedButDisabled = await useConvexQuery(queryRef, { userId: '1' }, { server: false })
        return () => h('i', `${awaitedButDisabled.status.value},${notAwaited.status.value}`)
      },
    })

    const html = await renderOnServer(withSuspense(Lazy), { url })

    expect(html).toContain('pending,pending')
    expect(httpQuery).not.toHaveBeenCalled()
  })

  it('fetches the first page of paginated queries on the server and hydrates it', async () => {
    const payload = createPayload()
    httpQuery.mockResolvedValue(page([{ _id: 'a' }, { _id: 'b' }], { continueCursor: 'c1' }))
    const Feed = defineComponent({
      async setup() {
        const { data, status } = await useConvexPaginatedQuery(paginatedRef, { userId: '1' }, { numItems: 2 })
        return () => h('ol', { 'data-status': status.value }, data.value.map(item => h('li', item._id)))
      },
    })
    const root = withSuspense(Feed)

    const html = await Promise.race([
      renderOnServer(root, { url, hydration: payload.server }),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('SSR render hung')), 2000)),
    ])

    expect(html).toContain('data-status="success"')
    expect(httpQuery).toHaveBeenCalledWith(paginatedRef, { userId: '1', paginationOpts: { numItems: 2, cursor: null } }, expect.anything())

    const { container, mismatches } = await hydrate(root, html, { url, hydration: payload.client })
    expect(mismatches).toEqual([])
    expect(container.innerHTML).toBe(html)
    expect(httpQuery).toHaveBeenCalledTimes(1)
    expect(getLastRealtimeClient().listeners[0].args.paginationOpts).toMatchObject({ numItems: 2, cursor: null })
  })

  it('does not hang paginated queries on the server without a URL', async () => {
    const Feed = defineComponent({
      async setup() {
        const { status } = await useConvexPaginatedQuery(paginatedRef, { userId: '1' }, { numItems: 2 })
        return () => h('b', status.value)
      },
    })

    await expect(renderOnServer(withSuspense(Feed), {})).resolves.toContain('pending')
  })

  it('renders auth components from the SSR auth state and hydrates them', async () => {
    const Gate = defineComponent({
      render: () => h('main', [
        h(ConvexAuthenticated, null, () => 'signed-in'),
        h(ConvexUnauthenticated, null, () => 'signed-out'),
      ]),
    })

    const html = await renderOnServer(Gate, { url, initialAuth: { isAuthenticated: true } })
    expect(html).toContain('signed-in')
    expect(html).not.toContain('signed-out')

    const { container, mismatches } = await hydrate(Gate, html, { url, initialAuth: { isAuthenticated: true } })
    expect(mismatches).toEqual([])
    expect(container.textContent).toBe('signed-in')
  })
})
