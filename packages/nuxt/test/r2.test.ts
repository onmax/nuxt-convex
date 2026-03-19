import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch, setup, useTestContext } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('./fixtures/r2', import.meta.url))

describe('nuxt-convex r2', async () => {
  await setup({ rootDir, buildDir: '.nuxt' })

  it('generates r2 templates when r2: true', () => {
    const buildDir = useTestContext().nuxt!.options.buildDir
    const r2TemplatePath = join(buildDir, 'convex/r2.mjs')
    const r2TypesPath = join(buildDir, 'types/convex-r2.d.ts')
    expect(existsSync(r2TemplatePath)).toBe(true)
    expect(existsSync(r2TypesPath)).toBe(true)
  })

  it('exposes r2 flag via runtime config', async () => {
    const res = await $fetch<{ r2: boolean }>('/api/config')
    expect(res.r2).toBe(true)
  })
})
