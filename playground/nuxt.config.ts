import NuxtConvex from '../src/module'

export default defineNuxtConfig({
  modules: [NuxtConvex, '@nuxt/ui', 'better-auth-nuxt'],
  css: ['~/assets/css/main.css'],

  convex: {
    storage: true,
  },

  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://nuxt-convex-playground.workers.dev',
    },
  },

  auth: {
    redirects: {
      login: '/',
      guest: '/',
    },
  },

  nitro: {
    preset: 'cloudflare-module',
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-01-01',
})
