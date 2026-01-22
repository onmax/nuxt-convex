import { defineClientAuth } from '@onmax/nuxt-better-auth/config'
import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins'

export default defineClientAuth(() => ({
  baseURL: `${import.meta.env.VITE_CONVEX_SITE_URL}/api/auth`,
  plugins: [convexClient(), crossDomainClient()],
}))
