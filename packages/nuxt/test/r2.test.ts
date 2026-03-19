import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch, setup, useTestContext } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('./fixtures/r2', import.meta.url))

describe('nuxt-convex r2', async () => {
  await setup({ rootDir, buildDir: '.nuxt' })

  it('auto-imports useConvexR2Upload without generating an r2 virtual module', () => {
    const buildDir = useTestContext().nuxt!.options.buildDir
    const imports = readFileSync(join(buildDir, 'types/imports.d.ts'), 'utf8')

    expect(useTestContext().nuxt!.options.alias['#convex/r2']).toBeUndefined()
    expect(imports).toContain('useConvexR2Upload')
  })

  it('exposes r2 flag via runtime config', async () => {
    const res = await $fetch<{ r2: boolean }>('/api/config')
    expect(res.r2).toBe(true)
  })
})
