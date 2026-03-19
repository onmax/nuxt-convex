import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setupSubprocessE2E } from './helpers/subprocess-e2e'

const rootDir = fileURLToPath(new URL('./fixtures/no-storage', import.meta.url))

describe('nuxt-convex without storage', () => {
  const fixture = setupSubprocessE2E({ rootDir, server: false })

  it('keeps only the always-available public aliases', () => {
    expect(fixture.alias('#convex')).toBeTruthy()
    expect(fixture.alias('#convex/api')).toBeTruthy()
    expect(fixture.alias('#convex/advanced')).toBeTruthy()
    expect(fixture.alias('#convex/storage')).toBeUndefined()
    expect(fixture.alias('#convex/r2')).toBeUndefined()
  })

  it('keeps root composables auto-imported and omits storage helpers', () => {
    const imports = readFileSync(join(fixture.buildDir(), 'types/imports.d.ts'), 'utf8')

    expect(imports).toContain('useConvexQuery')
    expect(imports).toContain('useConvexAuth')
    expect(imports).toContain('useConvexConnectionState')
    expect(imports).not.toContain('useConvexStorage')
    expect(imports).not.toContain('useConvexUpload')
    expect(imports).not.toContain('useConvexR2Upload')
    expect(imports).not.toContain('useConvexClient')
    expect(imports).not.toContain('useConvexHttpClient')
  })
})
