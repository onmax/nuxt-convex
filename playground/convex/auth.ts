import type { GenericCtx } from '@convex-dev/better-auth'
import type { BetterAuthOptions } from 'better-auth/minimal'
import type { DataModel } from './_generated/dataModel'
import process from 'node:process'
import { createClient } from '@convex-dev/better-auth'
import { convex, crossDomain } from '@convex-dev/better-auth/plugins'
import { betterAuth } from 'better-auth/minimal'
import { components } from './_generated/api'
import authConfig from './auth.config'

const siteUrl = process.env.SITE_URL!

export const authComponent = createClient<DataModel>(components.betterAuth, {
  verbose: false,
})

export function createAuthOptions(ctx: GenericCtx<DataModel>): BetterAuthOptions {
  return ({
    appName: 'nuxt-convex Playground',
    trustedOrigins: [siteUrl, 'https://*.onmax.me'],
    database: authComponent.adapter(ctx),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      },
    },
    session: {
      cookieCache: { enabled: true, maxAge: 7 * 24 * 60 * 60, strategy: 'jwe' },
    },
    account: {
      storeStateStrategy: 'cookie',
      storeAccountCookie: true,
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex({ authConfig }),
    ],
  }) satisfies BetterAuthOptions
}

export function createAuth(ctx: GenericCtx<DataModel>): ReturnType<typeof betterAuth> {
  return betterAuth(createAuthOptions(ctx))
}
