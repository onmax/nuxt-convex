import process from 'node:process'
import { defineBetterAuthConfig } from 'better-auth-nuxt/config'

export default defineBetterAuthConfig({
  appName: 'nuxt-convex Playground',
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
})
