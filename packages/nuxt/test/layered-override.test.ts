import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('./fixtures/layered-app-override', import.meta.url))

describe('nuxt-convex layered overrides', async () => {
  await setup({ rootDir })

  it('keeps the app layer authoritative when both app and base layers define generated files', async () => {
    const res = await $fetch<{ layer: string, url: string }>('/api/layer')
    expect(res.layer).toBe('app')
    expect(res.url).toBe('https://override.convex.cloud')
  })
})
