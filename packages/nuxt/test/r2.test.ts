import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setupSubprocessE2E } from './helpers/subprocess-e2e'

const rootDir = fileURLToPath(new URL('./fixtures/r2', import.meta.url))

describe('nuxt-convex r2', () => {
  const fixture = setupSubprocessE2E({ rootDir })

  it('auto-imports useConvexR2Upload without generating an r2 virtual module', () => {
    const imports = readFileSync(join(fixture.buildDir(), 'types/imports.d.ts'), 'utf8')

    expect(fixture.alias('#convex/r2')).toBeUndefined()
    expect(imports).toContain('useConvexR2Upload')
  })

  it('exposes r2 flag via runtime config', async () => {
    const res = await fixture.fetch<{ r2: boolean }>('/api/config')
    expect(res.r2).toBe(true)
  })
})
