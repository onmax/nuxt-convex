import type { ConvexClientOptions } from 'convex/browser'
import type { ConvexHydrationEntry, ConvexVueOptions } from 'vue-convex'
import type { ConvexStorageOptions } from 'vue-convex/storage'
import type { ConvexPublicRuntimeConfig } from '../types/config'
import { convexVue } from '#convex'
import { defineNuxtPlugin, useRequestEvent, useRuntimeConfig, useState } from '#imports'
import { getStorageRefs } from '#nuxt-convex/storage-refs-runtime'

// `server` is what nuxt-convex <= 0.0.7 wrote for `ssr`
type RuntimeConvexConfig = Partial<ConvexPublicRuntimeConfig> & { server?: boolean }

/** Set by the nuxt-convex server middleware: resolves the current request's Convex JWT (memoized per request). */
type ConvexTokenResolver = () => Promise<string | null | undefined>

const PAYLOAD_PREFIX = '$convex:'
let warnedMissingUrl = false

export default defineNuxtPlugin({
  name: 'nuxt-convex',
  async setup(nuxtApp) {
    // SAFETY: the module writes `public.convex` from the resolved options; old builds may only have `server`.
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
      // SAFETY: `$convexToken` is only set by nuxt-convex's server runtime, always to a token resolver.
      const resolve = event?.context.$convexToken as ConvexTokenResolver | undefined
      if (config.url && resolve) {
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

    const clientOptions: ConvexClientOptions = { ...config.clientOptions }
    // Hold queries until the token is in place, so they don't run anonymously first.
    if (import.meta.client && authState.value?.isAuthenticated)
      clientOptions.expectAuth = true

    // SAFETY: only `$convex:` keys are read through this view, and only the hydration adapter below writes them.
    const payload = nuxtApp.payload.data as Record<string, ConvexHydrationEntry | undefined>
    const options: ConvexVueOptions = {
      url: config.url || undefined,
      server: config.ssr ?? config.server ?? true,
      serverAuth,
      initialAuth: authState.value ?? undefined,
      clientOptions,
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
        // SAFETY: getStorageRefs() returns the generated `api._hub.storage`, which holds the scaffolded storage functions.
        const storage = getStorageRefs() as Partial<ConvexStorageOptions> | undefined
        if (storage?.generateUploadUrl && storage.getUrl && storage.remove)
          storageOptions = { generateUploadUrl: storage.generateUploadUrl, getUrl: storage.getUrl, remove: storage.remove }
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
