import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = resolve(process.cwd(), '../..')
const ignoredDirectories = new Set(['.cache', '.nuxt', '.output', '.wrangler', 'node_modules'])

function collectFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name))
        return []
      return collectFiles(path)
    }
    if (entry.isFile())
      return path
    return []
  })
}

function search(pattern: string): string {
  const roots = ['docs/content', 'playground'].map(path => join(repoRoot, path))

  for (const root of roots) {
    for (const file of collectFiles(root)) {
      const contents = readFileSync(file, 'utf8')
      const line = contents.split('\n').findIndex(nextLine => nextLine.includes(pattern))
      if (line >= 0)
        return `${file}:${line + 1}`
    }
  }

  return ''
}

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('docs contract', () => {
  it('does not document a #convex/r2 virtual module', () => {
    expect(search('#convex/r2')).toBe('')
    expect(search(`import { useUploadFile } from '#convex/r2'`)).toBe('')
  })

  it('does not document internal storage runtime helpers', () => {
    expect(search('#convex/storage-refs')).toBe('')
  })

  it('does not recommend direct @onmax/convex-vue runtime imports in Nuxt-facing docs', () => {
    const nuxtModuleDoc = read('docs/content/2.nuxt-module/index.md')
    const virtualModulesDoc = read('docs/content/5.api-reference/2.virtual-modules.md')

    expect(nuxtModuleDoc).not.toContain(`from '@onmax/convex-vue`)
    expect(virtualModulesDoc).not.toContain(`from '@onmax/convex-vue`)
  })

  it('documents the public Nuxt alias matrix consistently', () => {
    const nuxtModuleDoc = read('docs/content/2.nuxt-module/index.md')
    const moduleConfigurationDoc = read('docs/content/5.api-reference/1.module-configuration.md')
    const virtualModulesDoc = read('docs/content/5.api-reference/2.virtual-modules.md')

    expect(nuxtModuleDoc).toContain('`#convex`, `#convex/api`, and `#convex/advanced` aliases')
    expect(nuxtModuleDoc).toContain('Optional `#convex/storage` alias')
    expect(moduleConfigurationDoc).toContain('`#convex`, `#convex/api`, `#convex/advanced`')
    expect(moduleConfigurationDoc).toContain('The module does not create an R2-specific alias')
    expect(virtualModulesDoc).toContain('| `#convex`')
    expect(virtualModulesDoc).toContain('| `#convex/advanced`')
    expect(virtualModulesDoc).toContain('| `#convex/api`')
    expect(virtualModulesDoc).toContain('| `#convex/storage`')
  })

  it('does not freeze Better Auth docs to pkg.pr.new installs', () => {
    const betterAuthDoc = read('docs/content/6.integrations/1.better-auth.md')

    expect(search('pkg.pr.new')).toBe('')
    expect(betterAuthDoc).toContain('dependency-constrained')
    expect(betterAuthDoc).not.toContain('prerelease or PR-built packages')
  })
})
