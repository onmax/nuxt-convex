import type { ConvexHydrationEntry, ConvexVueOptions } from 'vue-convex'
import type { ConvexStorageOptions } from 'vue-convex/storage'
import { convexVue } from '#convex'
import { defineNuxtPlugin, useRequestEvent, useRuntimeConfig, useState } from '#imports'
import { getStorageRefs } from '#nuxt-convex/storage-refs-runtime'

interface RuntimeConvexConfig {
  url?: string
  storage?: boolean
  server?: boolean
}

/** Set by the nuxt-convex Nitro plugin: resolves the current request's Convex JWT (memoized per request). */
type ConvexTokenResolver = () => Promise<string | null | undefined>

const PAYLOAD_PREFIX = '$convex:'
let warnedMissingUrl = false

export default defineNuxtPlugin({
  name: 'nuxt-convex',
  async setup(nuxtApp) {
    const config = (useRuntimeConfig().public.convex ?? {}) as RuntimeConvexConfig
    // Only `isAuthenticated` is shared with the client, never the token.
    const authState = useState<{ isAuthenticated: boolean } | null>('convex:auth', () => null)
    let serverAuth: ConvexVueOptions['serverAuth']

    if (!config.url && import.meta.dev && !warnedMissingUrl) {
      warnedMissingUrl = true
      console.warn('[nuxt-convex] No Convex URL configured, so the runtime starts disconnected. Set CONVEX_URL or NUXT_PUBLIC_CONVEX_URL.')
    }

    if (import.meta.server) {
      const event = useRequestEvent()
      const resolve = event?.context.$convexToken as ConvexTokenResolver | undefined
      if (config.url && typeof resolve === 'function') {
        let token: Promise<string | null> | undefined
        const getToken = (): Promise<string | null> => token ??= Promise.resolve(resolve()).then(value => value ?? null)
        serverAuth = { getToken }
        const isAuthenticated = await getToken().then(Boolean, (error) => {
          console.error('[nuxt-convex] Failed to resolve the Convex token; rendering signed out.', error)
          return false
        })
        authState.value = { isAuthenticated }
      }
    }

    const payload = nuxtApp.payload.data as Record<string, ConvexHydrationEntry | undefined>
    const options: ConvexVueOptions = {
      url: config.url || undefined,
      server: config.server ?? true,
      serverAuth,
      initialAuth: authState.value ?? undefined,
      // Hold queries until the token is in place, so they don't run anonymously first.
      clientOptions: import.meta.client && authState.value?.isAuthenticated ? { expectAuth: true } : undefined,
      hydration: {
        set: (key, entry) => {
          payload[PAYLOAD_PREFIX + key] = entry
        },
        get: key => payload[PAYLOAD_PREFIX + key],
        isHydrating: () => nuxtApp.isHydrating === true && !!nuxtApp.payload.serverRendered,
      },
    }

    if (import.meta.client) {
      // SSR results only seed the first render; later navigations must not reuse them.
      nuxtApp.hooks.hookOnce('app:suspense:resolve', () => {
        for (const key of Object.keys(payload)) {
          if (key.startsWith(PAYLOAD_PREFIX))
            delete payload[key]
        }
      })
    }

    let storageOptions: ConvexStorageOptions | undefined
    if (config.storage) {
      try {
        const storage = getStorageRefs() as Partial<ConvexStorageOptions> | undefined
        if (storage?.generateUploadUrl && storage?.getUrl && storage?.remove)
          storageOptions = storage as ConvexStorageOptions
      }
      catch (error) {
        console.warn('[nuxt-convex] Failed to load storage refs from the generated Convex API.', error)
      }
    }

    nuxtApp.vueApp.use(convexVue, options)
    if (storageOptions) {
      const { convexVueStorage } = await import('#nuxt-convex/storage-runtime')
      nuxtApp.vueApp.use(convexVueStorage, storageOptions)
    }
  },
})
