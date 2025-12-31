export default defineNuxtConfig({
  extends: ['docus'],

  css: ['~/assets/css/main.css'],

  content: {
    experimental: {
      sqliteConnector: 'native',
    },
  },

  site: {
    url: 'https://nuxt-convex.onmax.me',
    name: 'Nuxt Convex',
    description: 'Nuxt module for Convex - reactive backend with real-time sync, file storage, and auto-imports.',
    defaultLocale: 'en',
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [{ name: 'twitter:card', content: 'summary_large_image' }],
    },
  },

  mdc: {
    highlight: {
      theme: { default: 'synthwave-84', dark: 'synthwave-84', light: 'one-light' },
      langs: ['bash', 'json', 'js', 'ts', 'vue', 'html', 'css'],
    },
  },

  devtools: { enabled: true },

  future: { compatibilityVersion: 4 },

  compatibilityDate: '2025-01-01',

  llms: {
    domain: 'nuxt-convex.onmax.me',
  },
})
