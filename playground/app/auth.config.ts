import { defineClientAuth } from '@onmax/nuxt-better-auth/config'

export default defineClientAuth(() => ({
  baseURL: `${import.meta.env.VITE_CONVEX_SITE_URL}/api/auth`,
}))
