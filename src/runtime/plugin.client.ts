import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { createConvexVue } from '@convex-vue/core'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const convexUrl = (config.public.convex as { url?: string })?.url

  if (!convexUrl) {
    console.warn('[nuxt-convex] No Convex URL configured. Set CONVEX_URL env var or run `npx convex dev`')
    return
  }

  const convex = createConvexVue({ convexUrl })
  nuxtApp.vueApp.use(convex)

  return { provide: { convex } }
})
