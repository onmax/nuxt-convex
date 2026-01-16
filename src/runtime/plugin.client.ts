import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { ConvexClient } from 'convex/browser'
import { CONVEX_INJECTION_KEY } from './client'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const convexUrl = (config.public.convex as { url?: string })?.url

  if (!convexUrl) {
    console.warn('[nuxt-convex] No Convex URL configured. Set CONVEX_URL env var or run `npx convex dev`')
    return
  }

  const client = new ConvexClient(convexUrl)
  nuxtApp.vueApp.provide(CONVEX_INJECTION_KEY, client)

  return { provide: { convex: client } }
})
