/* eslint-disable node/prefer-global/process */
import type { GenericCtx } from '@convex-dev/better-auth'
import type { DataModel } from './_generated/dataModel'
import { createClient } from '@convex-dev/better-auth'
import { convex } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth/minimal'
import { components } from './_generated/api'
import { query } from './_generated/server'
import authConfig from './auth.config'
import { getPlaygroundSiteUrl, isGitHubAuthEnabled } from './env'

const siteUrl = getPlaygroundSiteUrl()
const enableGitHubAuth = isGitHubAuthEnabled()
const useSecureCookies = siteUrl.startsWith('https://')

export const authComponent = createClient<DataModel>(components.betterAuth, {
  cors: { allowedOrigins: [siteUrl] },
})

export function createAuth(ctx: GenericCtx<DataModel>): ReturnType<typeof betterAuth> {
  return betterAuth({
    // Requests reach Convex through the Nuxt app's /api/auth proxy, so the app is the public URL
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    useSecureCookies,
    database: authComponent.adapter(ctx),
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    socialProviders: enableGitHubAuth
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          },
        }
      : {},
    plugins: [convex({ authConfig })],
  })
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx)
  },
})
