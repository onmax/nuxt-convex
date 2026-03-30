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

  it('does not recommend direct vue-convex runtime imports in Nuxt-facing docs', () => {
    const nuxtModuleDoc = read('docs/content/2.nuxt-module/index.md')
    const virtualModulesDoc = read('docs/content/5.api-reference/2.virtual-modules.md')

    expect(nuxtModuleDoc).not.toContain(`from 'vue-convex`)
    expect(virtualModulesDoc).not.toContain(`from 'vue-convex`)
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

  it('pins the Better Auth docs to the tested integration stack', () => {
    const betterAuthDoc = read('docs/content/6.integrations/1.better-auth.md')

    expect(betterAuthDoc).toContain('dependency-constrained')
    expect(betterAuthDoc).toContain('@onmax/nuxt-better-auth@0.0.2-alpha.31')
    expect(betterAuthDoc).toContain('@convex-dev/better-auth@0.11.3')
    expect(betterAuthDoc).toContain('better-auth@1.5.6')
  })

  it('documents the supported Better Auth boundary through the playground flow', () => {
    const betterAuthDoc = read('docs/content/6.integrations/1.better-auth.md')

    expect(betterAuthDoc).toContain('email/password')
    expect(betterAuthDoc).toContain('optional and secondary')
    expect(betterAuthDoc).toContain('Session & Diagnostics')
    expect(betterAuthDoc).toContain('playground')
  })

  it('documents the supported R2 path without inventing new aliases', () => {
    const r2Doc = read('docs/content/6.integrations/2.r2.md')
    const nuxtR2Doc = read('docs/content/2.nuxt-module/2.cloudflare-r2.md')

    expect(r2Doc).toContain('useConvexR2Upload')
    expect(r2Doc).toContain('Cloudflare R2')
    expect(r2Doc).toContain('playground')
    expect(r2Doc).toContain('does not add a new virtual module or a new `#convex/*` alias')
    expect(nuxtR2Doc).toContain('Cloudflare R2')
    expect(nuxtR2Doc).toContain('does not create an R2-specific alias')
  })
})
