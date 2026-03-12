import type { ConvexStorageReferences, ConvexVueOptions } from 'convex-vue'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { convexVue } from 'convex-vue'

interface RuntimeConvexConfig {
  url?: string
  storage?: boolean
  server?: boolean
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

  if (config.storage) {
    try {
      const { storageRefs } = await import('#convex/storage-refs')
      const storage = storageRefs
      if (storage?.generateUploadUrl && storage?.getUrl && storage?.remove)
        options.storage = storage as ConvexStorageReferences
    }
    catch (error) {
      console.warn('[nuxt-convex] Failed to load storage refs from #convex/storage-refs.', error)
    }
  }

  nuxtApp.vueApp.use(convexVue, options)
})
