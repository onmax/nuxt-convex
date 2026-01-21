import process from 'node:process'
import NuxtConvex from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtConvex, '@nuxt/ui', '@nuxthub/core', '@onmax/nuxt-better-auth'],

  hub: {
    db: 'sqlite',
  },

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
    preset: 'cloudflare-pages',
    cloudflare: {
      wrangler: {
        d1_databases: [{ binding: 'DB', database_name: 'nuxt-convex-db', database_id: '0b69a5b9-e8e1-4398-aae0-1afd11f1bf9d' }],
      },
    },
  },

  auth: {
    redirects: {
      login: '/',
      guest: '/',
    },
  },

  convex: {
    storage: true,
  },
})
