import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('./fixtures/r2', import.meta.url))

describe('nuxt-convex r2', async () => {
  await setup({ rootDir, dev: true })

  it('generates r2 templates when r2: true', () => {
    const r2TemplatePath = join(rootDir, '.nuxt/convex/r2.mjs')
    const r2TypesPath = join(rootDir, '.nuxt/types/convex-r2.d.ts')
    expect(existsSync(r2TemplatePath)).toBe(true)
    expect(existsSync(r2TypesPath)).toBe(true)
  })

  it('exposes r2 flag via runtime config', async () => {
    const res = await $fetch<{ r2: boolean }>('/api/config')
    expect(res.r2).toBe(true)
  })
})
