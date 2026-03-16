import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { $fetch, setup, useTestContext } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('./fixtures/full', import.meta.url))

describe('nuxt-convex', async () => {
  await setup({ rootDir })

  function buildDir(): string {
    return useTestContext().nuxt!.options.buildDir
  }

  it('exposes convexUrl via runtime config', async () => {
    const res = await $fetch<{ url: string, hasUrl: boolean }>('/api/config')
    expect(res.url).toBe('https://test.convex.cloud')
    expect(res.hasUrl).toBe(true)
  })

  it('renders config in SSR', async () => {
    const html = await $fetch('/')
    expect(html).toContain('https://test.convex.cloud')
    expect(html).toContain('function,function,function,function')
  })

  it('scaffolds storage functions when storage: true', () => {
    const storagePath = join(rootDir, 'convex/_hub/storage.ts')
    expect(existsSync(storagePath)).toBe(true)
  })

  it('mirrors root, storage, and advanced aliases in generated files', () => {
    const rootModule = readFileSync(join(buildDir(), 'convex/index.mjs'), 'utf8')
    const storageModule = readFileSync(join(buildDir(), 'convex/storage.mjs'), 'utf8')
    const advancedModule = readFileSync(join(buildDir(), 'convex/advanced.mjs'), 'utf8')

    expect(rootModule).toContain("vue/src/index")
    expect(storageModule).toContain("vue/src/storage")
    expect(advancedModule).toContain("vue/src/advanced")
  })

  it('only auto-imports storage helpers when storage is enabled', () => {
    const sharedImports = readFileSync(join(buildDir(), 'types/imports.d.ts'), 'utf8')

    expect(sharedImports).toContain('useConvexQuery')
    expect(sharedImports).toContain('useConvexAuth')
    expect(sharedImports).toContain('useConvexStorage')
    expect(sharedImports).toContain('useConvexUpload')
    expect(sharedImports).not.toContain('useConvexClient')
    expect(sharedImports).not.toContain('useConvexHttpClient')
  })
})
