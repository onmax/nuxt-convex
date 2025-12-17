import { defineServerAuth } from '@onmax/nuxt-better-auth/runtime/config'

export default defineServerAuth(() => ({
  appName: 'nuxt-convex Playground',
  // OAuth only - no database needed
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
}))
