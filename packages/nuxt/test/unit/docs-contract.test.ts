import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import yaml from 'yaml'

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
})
