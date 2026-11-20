import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import yaml from 'yaml'
import { errors as vueErrors, warnings as vueWarnings } from '../../../vue/src/internal/diagnostics'
import { moduleErrors, moduleWarnings } from '../../src/internal/diagnostics'
import { runtimeErrors, runtimeWarnings } from '../../src/runtime/diagnostics'
import { authWarnings } from '../../src/runtime/server/internal/auth-diagnostics'

const repoRoot = resolve(process.cwd(), '../..')

function read(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('docs contract', () => {
  it('does not recommend direct vue-convex runtime imports in Nuxt-facing docs', () => {
    const nuxtModuleDoc = read('docs/content/2.nuxt-module/index.md')
    const virtualModulesDoc = read('docs/content/5.api-reference/02.virtual-modules.md')

    expect(nuxtModuleDoc).not.toContain(`from 'vue-convex`)
    expect(virtualModulesDoc).not.toContain(`from 'vue-convex`)
  })

  it('pins the Better Auth docs to the versions the playground installs', () => {
    const betterAuthDoc = read('docs/content/6.integrations/1.better-auth.md')
    const workspace = yaml.parse(read('pnpm-workspace.yaml'))
    const version = (range: string): string => range.replace(/^\^/, '')

    expect(betterAuthDoc).toContain(`@nuxtjs/better-auth@${version(workspace.catalogs.playground['@nuxtjs/better-auth'])}`)
    expect(betterAuthDoc).toContain(`@convex-dev/better-auth@${version(workspace.catalogs.convex['@convex-dev/better-auth'])}`)
    expect(betterAuthDoc).toContain(`better-auth@${workspace.catalogs.playground['better-auth']}`)
    expect(betterAuthDoc).toContain(`'@nuxtjs/better-auth>better-auth': ${workspace.peerDependencyRules.allowedVersions['@nuxtjs/better-auth>better-auth']}`)
  })

  it('has an error page for every diagnostic code, linked from the index', () => {
    const codes = [moduleErrors, moduleWarnings, runtimeErrors, runtimeWarnings, authWarnings, vueErrors, vueWarnings].flatMap(catalog => Object.keys(catalog))
    const index = read('docs/content/8.errors/index.md')

    expect(codes).toHaveLength(24)
    expect(new Set(codes).size).toBe(codes.length)
    for (const code of codes) {
      const slug = code.toLowerCase().replaceAll('_', '-')
      expect(existsSync(join(repoRoot, `docs/content/8.errors/${slug}.md`)), `${code} has no page`).toBe(true)
      expect(read(`docs/content/8.errors/${slug}.md`)).toContain(`Code: \`${code}\``)
      expect(index).toContain(`(/errors/${slug})`)
    }
  })

  it('links each catalog to those pages', () => {
    // Each file shares one docsBase between its catalogs, and only the error catalogs have no reporters to call
    const pages = [moduleErrors.NUXT_CONVEX_C0001(), runtimeErrors.NUXT_CONVEX_R0005(), vueErrors.VUE_CONVEX_R0001()].map(diagnostic => diagnostic.docs)

    expect(pages).toEqual([
      'https://nuxt-convex.onmax.me/errors/nuxt-convex-c0001',
      'https://nuxt-convex.onmax.me/errors/nuxt-convex-r0005',
      'https://nuxt-convex.onmax.me/errors/vue-convex-r0001',
    ])
  })
})
