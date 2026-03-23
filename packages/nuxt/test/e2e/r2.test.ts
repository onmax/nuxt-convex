import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setupSubprocessE2E } from '../helpers/subprocess-e2e'

const rootDir = fileURLToPath(new URL('../fixtures/r2', import.meta.url))

describe('nuxt-convex r2', () => {
  const fixture = setupSubprocessE2E({ rootDir })

  it('keeps the R2 helper as an auto-import without creating extra public aliases', () => {
    expect(fixture.alias('#convex')).toBeTruthy()
    expect(fixture.alias('#convex/api')).toBeTruthy()
    expect(fixture.alias('#convex/advanced')).toBeTruthy()
    expect(fixture.alias('#convex/storage')).toBeUndefined()
    expect(fixture.alias('#convex/r2')).toBeUndefined()
    expect(fixture.alias('convex-vue')).toBeUndefined()
    expect(fixture.alias('convex-vue/advanced')).toBeUndefined()
  })

  it('auto-imports the supported r2 helper without exposing extra runtime helpers', () => {
    const imports = readFileSync(join(fixture.buildDir(), 'types/imports.d.ts'), 'utf8')

    expect(imports).toContain('useConvexR2Upload')
    expect(imports).toContain('useConvexQuery')
    expect(imports).not.toContain('useConvexStorage')
    expect(imports).not.toContain('useConvexUpload')
    expect(imports).not.toContain('useConvexClient')
    expect(imports).not.toContain('useConvexHttpClient')
  })

  it('exposes the resolved runtime config in r2 mode', async () => {
    const res = await fixture.fetch<{
      convex: {
        r2: boolean
        server: boolean
        storage: boolean
        url: string
      }
    }>('/api/config')

    expect(res.convex).toEqual({
      r2: true,
      server: true,
      storage: false,
      url: 'https://test.convex.cloud',
    })
  })

  it('renders the supported r2 helper in SSR output', async () => {
    const html = await fixture.fetch<string>('/', { responseType: 'text' })

    expect(html).toContain('https://test.convex.cloud')
    expect(html).toContain('function,function')
  })
})
