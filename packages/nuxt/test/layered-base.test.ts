import { existsSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { resolve } from 'pathe'
import { describe, expect, it } from 'vitest'

const baseDir = fileURLToPath(new URL('./fixtures/layered-base', import.meta.url))
const rootDir = fileURLToPath(new URL('./fixtures/layered-app', import.meta.url))
const storagePath = join(baseDir, 'convex/_hub/storage.ts')
const generatedServerPath = join(baseDir, 'convex/_generated/server.ts')

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

  it('keeps scaffolded storage imports aligned with the authoritative generated server file', () => {
    const storageSource = readFileSync(storagePath, 'utf8')
    const match = storageSource.match(/import\s+\{\s*mutation,\s*query\s*\}\s+from\s+'([^']+)'/)

    expect(match?.[1]).toBeDefined()
    expect(resolve(join(baseDir, 'convex/_hub'), match![1])).toBe(join(baseDir, 'convex/_generated/server'))
    expect(existsSync(generatedServerPath)).toBe(true)
  })
})
