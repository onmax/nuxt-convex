import type { EffectScope } from 'vue'
import type { ConvexPublicRuntimeConfig } from '../../types/config'
import { effectScope, watch } from 'vue'
import { useConvexAuth } from '#convex'
import { useConvexController } from '#convex/advanced'
import { defineNuxtPlugin, useRuntimeConfig, useUserSession } from '#imports'
import { createBetterAuthTokenFetcher } from './token'

/**
 * Keeps the Convex client's identity in sync with the Better Auth session:
 * sign-in sets auth, sign-out clears it so the previous user's JWT is never reused.
 */
export default defineNuxtPlugin({
  name: 'nuxt-convex:better-auth',
  dependsOn: ['nuxt-convex'],
  setup(nuxtApp) {
    const config = useRuntimeConfig().public.convex as ConvexPublicRuntimeConfig
    const { session, ready } = useUserSession()
    const controller = useConvexController()
    let scope: EffectScope | undefined

    const whenReady = (): Promise<void> => new Promise((resolve) => {
      const stop = watch(ready, (value) => {
        if (value) {
          queueMicrotask(() => stop())
          resolve()
        }
      }, { immediate: true })
    })

    function authenticate(): void {
      scope?.stop()
      scope = effectScope(true)
      const fetchToken = createBetterAuthTokenFetcher({
        tokenPath: `${config.auth.basePath.replace(/\/$/, '')}/convex/token`,
        whenReady,
        hasSession: () => Boolean(session.value),
      })
      // `useConvexAuth` injects the Convex runtime, which needs the app context
      nuxtApp.runWithContext(() => scope!.run(() => useConvexAuth({ fetchToken })))
    }

    // Before Better Auth settles the fetcher waits, so Convex reports `isLoading` instead of signed out
    authenticate()

    watch(() => ready.value ? session.value?.id ?? null : undefined, (sessionId, previous) => {
      if (sessionId === undefined || previous === undefined)
        return
      if (sessionId) {
        authenticate()
        return
      }
      scope?.stop()
      scope = undefined
      controller.getClient()?.clearAuth()
    })
  },
})
