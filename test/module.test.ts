import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('./fixtures/full', import.meta.url))

describe('nuxt-convex', async () => {
  await setup({ rootDir, dev: true })

  it('exposes convexUrl via runtime config', async () => {
    const res = await $fetch<{ url: string, hasUrl: boolean }>('/api/config')
    expect(res.url).toBe('https://test.convex.cloud')
    expect(res.hasUrl).toBe(true)
  })

  it('renders config in SSR', async () => {
    const html = await $fetch('/')
    expect(html).toContain('https://test.convex.cloud')
  })

  it('scaffolds storage functions when storage: true', () => {
    const storagePath = join(rootDir, 'convex/_hub/storage.ts')
    expect(existsSync(storagePath)).toBe(true)
  })
})
