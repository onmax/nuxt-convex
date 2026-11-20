import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execPath } from 'node:process'
import { describe, expect, it } from 'vitest'

describe('vue-convex exports', async () => {
  it('matches the intended entrypoint surface', async () => {
    const rootExports = await import('../dist/index.mjs')
    const advancedExports = await import('../dist/advanced.mjs')
    const storageExports = await import('../dist/storage.mjs')

    expect(Object.keys(rootExports).sort()).toEqual([
      'ConvexAuthLoading',
      'ConvexAuthenticated',
      'ConvexUnauthenticated',
      'convexVue',
      'insertAtBottomIfLoaded',
      'insertAtPosition',
      'insertAtTop',
      'isConvexError',
      'optimisticallyUpdateValueInPaginatedQuery',
      'useConvexAction',
      'useConvexAuth',
      'useConvexConnectionState',
      'useConvexMutation',
      'useConvexPaginatedQuery',
      'useConvexQueries',
      'useConvexQuery',
    ])
    expect(Object.keys(advancedExports).sort()).toEqual([
      'createConvexVueController',
      'useConvexClient',
      'useConvexController',
      'useConvexHttpClient',
    ])
    expect(Object.keys(storageExports).sort()).toEqual([
      'convexVueStorage',
      'useConvexStorage',
      'useConvexUpload',
    ])
  })

  it.each([
    ['vue-convex', 'useConvexQuery'],
    ['vue-convex/advanced', 'useConvexClient'],
    ['vue-convex/storage', 'useConvexUpload'],
  ])('loads %s without Node require(esm)', (entry, symbol) => {
    execFileSync(execPath, ['--no-experimental-require-module', '-e', `
      const assert = require('node:assert/strict')
      const [entry, symbol] = process.argv.slice(1)
      assert.equal(typeof require(entry)[symbol], 'function')
    `, entry, symbol])
  })

  it('keeps internal symbols out of the built declarations', () => {
    const rootTypes = readFileSync(resolve(process.cwd(), 'dist/index.d.mts'), 'utf8')
    const advancedTypes = readFileSync(resolve(process.cwd(), 'dist/advanced.d.mts'), 'utf8')
    const storageTypes = readFileSync(resolve(process.cwd(), 'dist/storage.d.mts'), 'utf8')

    expect(rootTypes).not.toContain('useConvexClient')
    expect(rootTypes).not.toContain('useConvexStorage')
    expect(rootTypes).not.toContain('useConvexUpload')
    expect(rootTypes).not.toContain('getHttpClient')

    expect(advancedTypes).not.toContain('CONVEX_VUE_KEY')
    expect(advancedTypes).not.toContain('ConvexRuntimeContext')
    expect(advancedTypes).toContain('useConvexClient')
    expect(advancedTypes).toContain('useConvexHttpClient')

    expect(storageTypes).not.toContain('CONVEX_STORAGE_KEY')
  })
})
