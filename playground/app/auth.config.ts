import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins'
import { defineClientAuth } from '@onmax/nuxt-better-auth/config'

export default defineClientAuth(() => ({
  baseURL: '/api/auth',
  plugins: [convexClient(), crossDomainClient()],
}))
