import { defineServerAuth } from '@onmax/nuxt-better-auth/config'
import { parseBooleanFlag } from '../utils/playground-env'

export default defineServerAuth(({ runtimeConfig }) => {
  const enableGitHubAuth = parseBooleanFlag(runtimeConfig.public.enableGitHubAuth, false)

  return {
    appName: 'nuxt-convex Playground',
    ...(enableGitHubAuth
      ? {
          socialProviders: {
            github: {
              clientId: runtimeConfig.github?.clientId || '',
              clientSecret: runtimeConfig.github?.clientSecret || '',
            },
          },
        }
      : {}),
    session: {
      cookieCache: { enabled: true, maxAge: 7 * 24 * 60 * 60, strategy: 'jwe' },
    },
  }
})
