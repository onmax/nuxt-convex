import type { GenericCtx } from '@convex-dev/better-auth'
import type { DataModel } from './_generated/dataModel'
import process from 'node:process'
import { createClient } from '@convex-dev/better-auth'
import { convex, crossDomain } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth/minimal'
import { components } from './_generated/api'
import { query } from './_generated/server'
import authConfig from './auth.config'

const siteUrl = process.env.SITE_URL!

export const authComponent = createClient<DataModel>(components.betterAuth)

export function createAuth(ctx: GenericCtx<DataModel>): ReturnType<typeof betterAuth> {
  return betterAuth({
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    plugins: [crossDomain({ siteUrl }), convex({ authConfig })],
  })
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx)
  },
})
