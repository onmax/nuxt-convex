import type { NuxtConfig } from '@nuxt/schema'
import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import { describe, expect, it } from 'vitest'

const rootDir = fileURLToPath(new URL('../fixtures/better-auth', import.meta.url))

// Module setup only: no build, so these stay fast
async function setupModule(overrides: NuxtConfig) {
  const nuxt = await loadNuxt({ cwd: rootDir, dev: false, overrides })
  try {
    const plugins = nuxt.options.plugins.map(plugin => typeof plugin === 'string' ? { src: plugin } : plugin)
    return {
      plugins,
      tokenPlugin: plugins.find(plugin => /runtime\/better-auth\/plugin(?:\.\w+)?$/.test(plugin.src)),
      proxy: nuxt.options.serverHandlers.find(handler => /runtime\/server\/routes\/auth-proxy(?:\.\w+)?$/.test(String(handler.handler))),
      convex: nuxt.options.runtimeConfig.public.convex as Record<string, any>,
    }
  }
  finally {
    await nuxt.close()
  }
}

describe('better-auth integration', () => {
  it('registers the client token plugin and the auth proxy in clientOnly mode', async () => {
    const { plugins, tokenPlugin, proxy, convex } = await setupModule({ auth: { clientOnly: true } } as NuxtConfig)

    expect(tokenPlugin).toMatchObject({ mode: 'client' })
    // Appended, so it can depend on the Convex plugin
    expect(plugins.indexOf(tokenPlugin!)).toBeGreaterThan(plugins.findIndex(plugin => /runtime\/plugin(?:\.\w+)?$/.test(plugin.src)))
    expect(proxy).toMatchObject({ route: '/api/auth/**' })
    expect(convex.auth).toEqual({ provider: 'better-auth', basePath: '/api/auth', proxy: true })
  })

  it('leaves /api/auth to @nuxtjs/better-auth when it runs its own server', async () => {
    const { tokenPlugin, proxy, convex } = await setupModule({ auth: { clientOnly: false } } as NuxtConfig)

    expect(tokenPlugin).toBeDefined()
    expect(proxy).toBeUndefined()
    expect(convex.auth).toEqual({ provider: 'better-auth', basePath: '/api/auth', proxy: false })
  })

  it('does nothing auth-related with convex.auth: false', async () => {
    const { tokenPlugin, proxy, convex } = await setupModule({ auth: { clientOnly: true }, convex: { auth: false } } as NuxtConfig)

    expect(tokenPlugin).toBeUndefined()
    expect(proxy).toBeUndefined()
    expect(convex.auth.provider).toBe('none')
  })

  it('honours a custom base path', async () => {
    const { proxy, convex } = await setupModule({ auth: { clientOnly: true }, convex: { auth: { basePath: '/auth/' } } } as NuxtConfig)

    expect(proxy).toMatchObject({ route: '/auth/**' })
    expect(convex.auth.basePath).toBe('/auth/')
  })

  it('rejects the removed convex database provider', async () => {
    await expect(setupModule({ auth: { clientOnly: false, database: { provider: 'convex' } } } as NuxtConfig))
      .rejects
      .toThrow(/`convex` Better Auth database provider was removed/)
  })

  it('keeps `server` as a deprecated alias of `ssr`', async () => {
    expect((await setupModule({ convex: { server: false } } as NuxtConfig)).convex.ssr).toBe(false)
    expect((await setupModule({ convex: { server: false, ssr: true } } as NuxtConfig)).convex.ssr).toBe(true)
  })
})
