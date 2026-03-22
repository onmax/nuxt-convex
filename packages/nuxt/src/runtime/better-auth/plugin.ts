import { useConvexAuth } from '#convex'
import { defineNuxtPlugin, useRequestHeaders } from '#imports'

export default defineNuxtPlugin(() => {
  if (import.meta.server)
    return

  useConvexAuth({
    fetchToken: async () => {
      try {
        const res = await $fetch<{ token: string }>('/api/auth/convex/token', {
          headers: useRequestHeaders(['cookie']),
        })
        return res?.token ?? null
      }
      catch {
        return null
      }
    },
  })
})
