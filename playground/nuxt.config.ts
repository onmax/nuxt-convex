import process from 'node:process'
import NuxtConvex from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtConvex, '@nuxt/ui', 'better-auth-nuxt'],

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://nuxt-convex-playground.workers.dev',
    },
  },
  compatibilityDate: '2025-01-01',

  nitro: {
    preset: 'cloudflare-module',
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
