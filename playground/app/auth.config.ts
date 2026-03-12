import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins'
import { defineClientAuth } from '@onmax/nuxt-better-auth/config'

export default defineClientAuth(({ siteUrl }) => ({
  baseURL: new URL('/api/auth', siteUrl).toString(),
  plugins: [convexClient(), crossDomainClient()],
}))
