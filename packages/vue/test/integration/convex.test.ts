/**
 * End-to-end check against a real Convex deployment, e.g. a local `npx convex dev`
 * whose convex/tasks.ts exports `list` (query, no args) and `add` (mutation, `{ text }`).
 * Skipped unless CONVEX_INTEGRATION_URL is set: CONVEX_INTEGRATION_URL=http://127.0.0.1:3210
 */
import type { ConvexHydrationEntry } from '../../src/index'
import { createRequire } from 'node:module'
import process from 'node:process'
import { ConvexHttpClient } from 'convex/browser'
import { makeFunctionReference } from 'convex/server'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h, Suspense } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { convexVue, useConvexQuery } from '../../src/index'

const url = process.env.CONVEX_INTEGRATION_URL
// Node's global WebSocket dispatches through jsdom's Event under vitest and throws; `ws` (a jsdom dependency) doesn't.
const require = createRequire(createRequire(import.meta.url).resolve('jsdom'))
const NodeWebSocket = require('ws') as typeof WebSocket

const list = makeFunctionReference<'query', Record<string, never>, Array<{ _id: string, text: string }>>('tasks:list')
const add = makeFunctionReference<'mutation', { text: string }, string>('tasks:add')

const Tasks = defineComponent({
  async setup() {
    const { data } = await useConvexQuery(list, {})
    return () => h('ul', data.value?.map(task => h('li', task.text)))
  },
})
const Root = defineComponent({ render: () => h(Suspense, null, { default: () => h(Tasks) }) })

describe.skipIf(!url)('real Convex backend', () => {
  it('renders on the server, hydrates, and receives live updates over the WebSocket', async () => {
    const marker = `integration-${Date.now()}`
    const http = new ConvexHttpClient(url!)
    await http.mutation(add, { text: `${marker}-ssr` })

    const payload: Record<string, ConvexHydrationEntry> = {}
    vi.stubGlobal('window', undefined)
    const serverApp = createSSRApp(Root).use(convexVue, {
      url,
      hydration: { set: (key, entry) => void (payload[key] = entry), get: () => undefined, isHydrating: () => false },
    })
    vi.unstubAllGlobals()
    const html = await renderToString(serverApp)
    expect(html).toContain(`${marker}-ssr`)

    const serialized = JSON.parse(JSON.stringify(payload)) as typeof payload
    let isHydrating = true
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const mismatch = vi.spyOn(console, 'warn')
    const container = document.createElement('div')
    container.innerHTML = html
    const clientApp = createSSRApp(Root).use(convexVue, {
      url,
      clientOptions: { webSocketConstructor: NodeWebSocket },
      hydration: { set: () => {}, get: key => serialized[key], isHydrating: () => isHydrating },
    })
    clientApp.mount(container)
    await new Promise(resolve => setTimeout(resolve))
    isHydrating = false

    expect(container.innerHTML).toBe(html)
    expect(mismatch).not.toHaveBeenCalledWith(expect.stringContaining('Hydration'), expect.anything())
    expect(fetchSpy).not.toHaveBeenCalled()

    await http.mutation(add, { text: `${marker}-live` })
    await vi.waitFor(() => expect(container.textContent).toContain(`${marker}-live`), { timeout: 10000, interval: 50 })

    clientApp.unmount()
  })
})
