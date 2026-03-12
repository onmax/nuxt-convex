import process from 'node:process'
import NuxtConvex from '../packages/nuxt/src/module'

export default defineNuxtConfig({
  modules: [NuxtConvex, '@nuxt/ui', '@nuxthub/core', '@onmax/nuxt-better-auth'],

  alias: {
    '@onmax/convex-vue': '../packages/vue/src/index.ts',
  },

  hub: {},

  icon: {
    customCollections: [{ prefix: 'custom', dir: './app/assets/icons' }],
  },

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    github: {
      clientId: process.env.NUXT_GITHUB_CLIENT_ID || '',
      clientSecret: process.env.NUXT_GITHUB_SECRET || '',
    },
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://demo-nuxt-convex.onmax.me',
    },
  },
  compatibilityDate: '2025-01-01',

  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      nodeCompat: true,
      wrangler: {
        name: 'demo-nuxt-convex',
        observability: { enabled: true },
      },
    },
  },

  auth: {
    clientOnly: true,
    redirects: {
      login: '/',
      guest: '/',
    },
  },

  convex: {
    storage: true,
  },
})
