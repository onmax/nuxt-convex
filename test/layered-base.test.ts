import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const baseDir = fileURLToPath(new URL('./fixtures/layered-base', import.meta.url))
const rootDir = fileURLToPath(new URL('./fixtures/layered-app', import.meta.url))
const storagePath = join(baseDir, 'convex/_hub/storage.ts')

rmSync(storagePath, { force: true })

describe('nuxt-convex layered defaults', async () => {
  await setup({ rootDir, dev: true })

  it('discovers convex files from the nearest base layer by default', async () => {
    const res = await $fetch<{ layer: string, url: string }>('/api/layer')
    expect(res.layer).toBe('base')
    expect(res.url).toBe('https://layered.convex.cloud')
  })

  it('scaffolds storage into a safe local base layer', () => {
    expect(existsSync(storagePath)).toBe(true)
  })
})
