import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setupSubprocessE2E } from '../helpers/subprocess-e2e'

const rootDir = fileURLToPath(new URL('../fixtures/full', import.meta.url))

describe('nuxt-convex', () => {
  const fixture = setupSubprocessE2E({ rootDir })

  it('exposes the resolved public runtime config', async () => {
    const res = await fixture.fetch<{
      convex: {
        dir: string
        r2: boolean
        server: boolean
        storage: boolean
        url: string
      }
    }>('/api/config')
    expect(res.convex).toEqual({
      dir: 'convex',
      r2: false,
      server: true,
      storage: true,
      url: 'https://test.convex.cloud',
    })
  })

  it('renders config in SSR', async () => {
    const html = await fixture.fetch<string>('/', { responseType: 'text' })
    expect(html).toContain('https://test.convex.cloud')
    expect(html).toContain('function,function,function,function')
  })

  it('registers the public Nuxt aliases for app code', () => {
    expect(fixture.alias('#convex')).toBeTruthy()
    expect(fixture.alias('#convex/api')).toBeTruthy()
    expect(fixture.alias('#convex/advanced')).toBeTruthy()
    expect(fixture.alias('#convex/storage')).toBeTruthy()
    expect(fixture.alias('#convex/r2')).toBeUndefined()
    expect(fixture.alias('#convex/storage-refs')).toBeUndefined()
    expect(fixture.alias('convex-vue')).toBeUndefined()
    expect(fixture.alias('convex-vue/advanced')).toBeUndefined()
  })

  it('scaffolds storage functions when storage: true', () => {
    const storagePath = join(rootDir, 'convex/_hub/storage.ts')
    expect(existsSync(storagePath)).toBe(true)
  })

  it('mirrors root, storage, and advanced aliases in generated files', () => {
    const rootModule = readFileSync(join(fixture.buildDir(), 'convex/index.mjs'), 'utf8')
    const storageModule = readFileSync(join(fixture.buildDir(), 'convex/storage.mjs'), 'utf8')
    const advancedModule = readFileSync(join(fixture.buildDir(), 'convex/advanced.mjs'), 'utf8')

    expect(rootModule).toContain('vue/src/index')
    expect(rootModule).not.toContain('vue/src/advanced')
    expect(storageModule).toContain('vue/src/storage')
    expect(advancedModule).toContain('vue/src/advanced')
  })

  it('keeps storage refs behind a lazy internal runtime helper', () => {
    const storageRefsRuntime = readFileSync(join(fixture.buildDir(), 'convex/storage-refs-runtime.mjs'), 'utf8')

    expect(storageRefsRuntime).toMatch(/import\s+\{\s*api\s*\}\s+from\s+['"].*convex\/_generated\/api['"]/)
    expect(storageRefsRuntime).toContain('return api?._hub?.storage')
    expect(storageRefsRuntime).not.toContain(`import('#convex/api')`)
  })

  it('only auto-imports storage helpers when storage is enabled', () => {
    const sharedImports = readFileSync(join(fixture.buildDir(), 'types/imports.d.ts'), 'utf8')

    expect(sharedImports).toContain('useConvexQuery')
    expect(sharedImports).toContain('useConvexAuth')
    expect(sharedImports).toContain('useConvexConnectionState')
    expect(sharedImports).toContain('useConvexStorage')
    expect(sharedImports).toContain('useConvexUpload')
    expect(sharedImports).not.toContain('useConvexR2Upload')
    expect(sharedImports).not.toContain('useConvexClient')
    expect(sharedImports).not.toContain('useConvexHttpClient')
  })

  it('registers the Nuxt-only global renderless components', () => {
    const components = readFileSync(join(fixture.buildDir(), 'components.d.ts'), 'utf8')

    expect(components).toContain('ConvexQuery')
    expect(components).toContain('ConvexPaginatedQuery')
  })
})
