import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('@onmax/convex-vue exports', async () => {
  it('matches the intended entrypoint surface', async () => {
    const rootExports = await import('../dist/index.js')
    const advancedExports = await import('../dist/advanced.js')
    const storageExports = await import('../dist/storage.js')

    expect(Object.keys(rootExports).sort()).toEqual([
      'convexVue',
      'useConvexAction',
      'useConvexMutation',
      'useConvexPaginatedQuery',
      'useConvexQuery',
    ])
    expect(Object.keys(advancedExports).sort()).toEqual([
      'createConvexVueController',
      'useConvexController',
    ])
    expect(Object.keys(storageExports).sort()).toEqual([
      'convexVueStorage',
      'useConvexStorage',
      'useConvexUpload',
    ])
  })

  it('keeps internal symbols out of the built declarations', () => {
    const rootTypes = readFileSync(resolve(process.cwd(), 'dist/index.d.ts'), 'utf8')
    const advancedTypes = readFileSync(resolve(process.cwd(), 'dist/advanced.d.ts'), 'utf8')
    const storageTypes = readFileSync(resolve(process.cwd(), 'dist/storage.d.ts'), 'utf8')

    expect(rootTypes).not.toContain('useConvexContext')
    expect(rootTypes).not.toContain('useConvexClient')
    expect(rootTypes).not.toContain('useConvexStorage')
    expect(rootTypes).not.toContain('useConvexUpload')
    expect(rootTypes).not.toContain('manualInit')
    expect(rootTypes).not.toContain('auth?:')

    expect(advancedTypes).not.toContain('CONVEX_VUE_KEY')
    expect(advancedTypes).not.toContain('ConvexRuntimeContext')

    expect(storageTypes).not.toContain('CONVEX_STORAGE_KEY')
  })
})
