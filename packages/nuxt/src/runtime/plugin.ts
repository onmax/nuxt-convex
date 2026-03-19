import type { ConvexVueOptions } from '@onmax/convex-vue'
import { convexVue } from '#convex'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { getStorageRefs } from '#nuxt-convex/storage-refs-runtime'

interface RuntimeConvexConfig {
  url?: string
  storage?: boolean
  server?: boolean
}

interface RuntimeConvexStorageOptions {
  generateUploadUrl: unknown
  getUrl: unknown
  remove: unknown
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = (useRuntimeConfig().public.convex ?? {}) as RuntimeConvexConfig

  if (!config.url) {
    console.warn('[nuxt-convex] No Convex URL configured. Set CONVEX_URL or NUXT_PUBLIC_CONVEX_URL')
    return
  }

  const options: ConvexVueOptions = {
    url: config.url,
    server: config.server ?? true,
  }
  let storageOptions: RuntimeConvexStorageOptions | undefined

  if (config.storage) {
    try {
      const storage = await getStorageRefs()
      if (storage?.generateUploadUrl && storage?.getUrl && storage?.remove)
        storageOptions = storage as RuntimeConvexStorageOptions
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
})
