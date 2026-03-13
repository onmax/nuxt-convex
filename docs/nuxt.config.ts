export default defineNuxtConfig({
  extends: ['docus'],

  modules: ['nuxt-skill-hub'],

  ogImage: { enabled: false },

  css: ['~/assets/css/main.css'],

  content: {
    experimental: {
      sqliteConnector: 'native',
    },
  },

  site: {
    url: 'https://nuxt-convex.onmax.me',
    name: 'Nuxt Convex',
    description: 'Convex for Nuxt and Vue with real-time queries, typed APIs, storage helpers, and integration guides.',
    defaultLocale: 'en',
  },

  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      meta: [{ name: 'twitter:card', content: 'summary_large_image' }],
    },
  },

  mdc: {
    highlight: {
      shikiEngine: 'javascript',
    },
  },

  devtools: { enabled: true },

  future: { compatibilityVersion: 4 },

  compatibilityDate: '2025-07-22',

  llms: {
    domain: 'nuxt-convex.onmax.me',
    title: 'Nuxt Convex',
    description: 'Convex integration docs for Nuxt and Vue.',
    full: {
      title: 'Nuxt Convex',
      description: 'Reference and guides for nuxt-convex and @onmax/convex-vue.',
    },
  },

  mcp: {
    name: 'Nuxt Convex documentation',
    browserRedirect: '/getting-started',
  },

  routeRules: {
    '/getting-started/introduction': { redirect: '/getting-started' },
    '/vue-core/introduction': { redirect: '/vue-core' },
    '/backend/schema': { redirect: '/convex-patterns/schema' },
    '/backend/queries': { redirect: '/convex-patterns/functions' },
    '/backend/mutations': { redirect: '/convex-patterns/functions' },
    '/backend/actions': { redirect: '/convex-patterns/functions' },
    '/composables/use-convex-query': { redirect: '/api-reference/use-convex-query' },
    '/composables/use-convex-mutation': { redirect: '/api-reference/use-convex-mutation' },
    '/composables/use-convex-action': { redirect: '/api-reference/use-convex-action' },
    '/composables/use-convex-client': { redirect: '/api-reference/use-convex-client' },
    '/composables/use-convex-paginated-query': { redirect: '/api-reference/use-convex-paginated-query' },
    '/file-storage/setup': { redirect: '/nuxt-module/file-storage' },
    '/file-storage/use-convex-storage': { redirect: '/api-reference/use-convex-storage' },
    '/file-storage/use-convex-upload': { redirect: '/api-reference/use-convex-upload' },
    '/api/configuration': { redirect: '/api-reference/module-configuration' },
  },
})
