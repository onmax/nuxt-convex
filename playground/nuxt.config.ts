import process from 'node:process'
import { getPlaygroundSiteUrl, getPlaygroundWorkerName, isGitHubAuthEnabled } from './utils/playground-env'

const env = process.env

export default defineNuxtConfig({
  modules: ['nuxt-convex', '@nuxt/ui', '@nuxthub/core', '@onmax/nuxt-better-auth'],

  hub: {},

  icon: {
    customCollections: [{ prefix: 'custom', dir: './app/assets/icons' }],
  },

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    github: {
      clientId: isGitHubAuthEnabled(env) ? env.NUXT_GITHUB_CLIENT_ID || '' : '',
      clientSecret: isGitHubAuthEnabled(env) ? env.NUXT_GITHUB_SECRET || '' : '',
    },
    public: {
      enableGitHubAuth: isGitHubAuthEnabled(env),
      siteUrl: getPlaygroundSiteUrl(env),
    },
  },
  compatibilityDate: '2026-03-22',

  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      nodeCompat: true,
      wrangler: {
        name: getPlaygroundWorkerName(env),
        observability: { enabled: true },
      },
    },
  },

  auth: {
    clientOnly: true,
    redirects: {
      login: '/',
      guest: '/',
      logout: '/',
    },
  },

  convex: {
    server: false,
    storage: true,
    r2: true,
  },
})
