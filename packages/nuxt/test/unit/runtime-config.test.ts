import type { Nuxt } from 'nuxt/schema'
import type { ConvexConfig } from '../../src/types/config'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { pathToFileURL } from 'node:url'
import { join } from 'pathe'
import * as v from 'valibot'
import { afterAll, describe, expect, it } from 'vitest'
import { resolveConvexOptions } from '../../src/internal/options'
import { convexPublicRuntimeConfigSchema, registerRuntimeConfigSchema, supportsRuntimeConfigSchemas } from '../../src/internal/runtime-config'

interface StandardJsonSchema {
  '~standard': { jsonSchema: { output: (options: { target: string }) => Record<string, any> } }
}

const root = mkdtempSync(join(tmpdir(), 'nuxt-convex-rc-'))
afterAll(() => rmSync(root, { recursive: true, force: true }))

function writePackage(dir: string, name: string, code: string): void {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, type: 'module', exports: './index.mjs' }))
  writeFileSync(join(dir, 'index.mjs'), code)
}

// Nuxt with its own Kit nested under it, like a Nuxt 5 app where this module resolves Kit 4
const nuxtDir = join(root, 'node_modules/nuxt')
const kitEntry = join(nuxtDir, 'node_modules/@nuxt/kit/index.mjs')
writePackage(nuxtDir, 'nuxt', 'export {}\n')
writePackage(join(nuxtDir, 'node_modules/@nuxt/kit'), '@nuxt/kit', 'export const updates = []\nexport function updateRuntimeConfig(update) { updates.push(update) }\n')

function fakeNuxt(options: { dev: boolean, convex: Record<string, unknown>, schemas?: boolean }): Nuxt {
  // SAFETY: registerRuntimeConfigSchema reads only these options.
  return {
    options: {
      dev: options.dev,
      rootDir: root,
      modulesDir: [join(root, 'node_modules')],
      runtimeConfig: { public: { convex: options.convex } },
      ...(options.schemas !== false && { _runtimeConfigSchemas: [] }),
    },
  } as unknown as Nuxt
}

describe('runtime config schema', () => {
  it('accepts every config the module writes', () => {
    const configs: ConvexConfig[] = [
      {},
      { url: 'https://a.convex.cloud', ssr: false, storage: true, r2: true },
      { clientOptions: { verbose: true, logger: false, authRefreshTokenLeewaySeconds: 30 } },
      { auth: { provider: 'better-auth', basePath: '/auth', proxy: false } },
      { auth: false },
    ]
    for (const options of configs)
      expect(v.safeParse(convexPublicRuntimeConfigSchema, resolveConvexOptions(options, { env: {} }).runtime).issues).toBeUndefined()
  })

  it('is detected from the schemas Nuxt 5 keeps', () => {
    expect(supportsRuntimeConfigSchemas(fakeNuxt({ dev: false, convex: {} }))).toBe(true)
    expect(supportsRuntimeConfigSchemas(fakeNuxt({ dev: false, convex: {}, schemas: false }))).toBe(false)
  })

  it('registers through the Kit that Nuxt resolves', async () => {
    const convex = { ...resolveConvexOptions({}, { env: {} }).runtime }
    await registerRuntimeConfigSchema(fakeNuxt({ dev: false, convex }))

    const { updates } = await import(pathToFileURL(kitEntry).href) as { updates: { public: { convex: StandardJsonSchema } }[] }
    expect(updates).toHaveLength(1)
    const json = updates[0]!.public.convex['~standard'].jsonSchema.output({ target: 'draft-2020-12' })
    expect(json.required).toEqual(expect.arrayContaining(['url', 'siteUrl', 'ssr', 'auth']))
    expect(json.properties.auth.properties.provider.enum).toEqual(['better-auth', 'none'])
    expect(json.properties.clientOptions.properties.authRefreshTokenLeewaySeconds.type).toBe('number')
    // Without a URL from the build, the server needs NUXT_PUBLIC_CONVEX_URL
    expect(convex).not.toHaveProperty('url')
  })

  it('keeps the URL default in development and when the build has one', async () => {
    const dev = { url: '' }
    await registerRuntimeConfigSchema(fakeNuxt({ dev: true, convex: dev }))
    expect(dev.url).toBe('')

    const build = { url: 'https://a.convex.cloud' }
    await registerRuntimeConfigSchema(fakeNuxt({ dev: false, convex: build }))
    expect(build.url).toBe('https://a.convex.cloud')
  })
})
