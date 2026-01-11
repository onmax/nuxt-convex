import { defineServerAuth } from '@onmax/nuxt-better-auth/config'

export default defineServerAuth(({ runtimeConfig }) => ({
  appName: 'nuxt-convex Playground',
  trustedOrigins: ['https://*.onmax.me'],
  socialProviders: {
    github: {
      clientId: runtimeConfig.github?.clientId || '',
      clientSecret: runtimeConfig.github?.clientSecret || '',
    },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 7 * 24 * 60 * 60, strategy: 'jwe' },
  },
  account: {
    storeStateStrategy: 'cookie',
    storeAccountCookie: true,
  },
}))
