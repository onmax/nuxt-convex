import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setupSubprocessE2E } from './helpers/subprocess-e2e'

const rootDir = fileURLToPath(new URL('./fixtures/layered-app-override', import.meta.url))

describe('nuxt-convex layered overrides', () => {
  const fixture = setupSubprocessE2E({ rootDir })

  it('keeps the app layer authoritative when both app and base layers define generated files', async () => {
    const res = await fixture.fetch<{ layer: string, url: string }>('/api/layer')
    expect(res.layer).toBe('app')
    expect(res.url).toBe('https://override.convex.cloud')
  })
})
