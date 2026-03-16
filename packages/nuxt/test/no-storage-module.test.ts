import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setup, useTestContext } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('./fixtures/no-storage', import.meta.url))

describe('nuxt-convex without storage', async () => {
  await setup({ rootDir, server: false })

  it('keeps root composables auto-imported and omits storage helpers', () => {
    const imports = readFileSync(join(useTestContext().nuxt!.options.buildDir, 'types/imports.d.ts'), 'utf8')

    expect(imports).toContain('useConvexQuery')
    expect(imports).toContain('useConvexAuth')
    expect(imports).not.toContain('useConvexStorage')
    expect(imports).not.toContain('useConvexUpload')
    expect(imports).not.toContain('useConvexClient')
    expect(imports).not.toContain('useConvexHttpClient')
  })
})
