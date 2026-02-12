import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'assert-better-auth-provider' },
  setup(_, nuxt) {
    nuxt.hook('modules:done', async () => {
      const providers: Record<string, any> = {}
      await nuxt.callHook('better-auth:database:providers', providers)

      const convex = providers.convex
      if (!convex) {
        throw new Error('[nuxt-convex:test] Expected better-auth convex provider to be registered')
      }

      await convex.setup?.({ nuxt, options: {}, clientOnly: false, provider: 'convex' })

      const runtimeConvexUrl = (nuxt.options.runtimeConfig as any).betterAuth?.convexUrl
      if (runtimeConvexUrl !== 'https://override.convex.cloud') {
        throw new Error(`[nuxt-convex:test] Expected runtimeConfig.betterAuth.convexUrl to be set, got: ${runtimeConvexUrl}`)
      }

      const code = convex.buildDatabaseCode({ hubDialect: 'sqlite', usePlural: false, camelCase: true })
      if (!code.includes(`from 'nuxt-convex/better-auth'`) || !code.includes(`from '#convex/api'`)) {
        throw new Error('[nuxt-convex:test] Expected generated DB code to import nuxt-convex/better-auth and #convex/api')
      }
    })
  },
})

