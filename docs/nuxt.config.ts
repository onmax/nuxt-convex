export default defineNuxtConfig({
  extends: ['docus'],

  ogImage: { enabled: false },

  // Docus turns its paid AI assistant on whenever a Vercel build has VERCEL_OIDC_TOKEN
  docus: {
    assistant: { enabled: false },
  },

  css: ['~/assets/css/main.css'],

  content: {
    experimental: {
      sqliteConnector: 'native',
    },
    build: {
      markdown: {
        // GitHub's themes read better than Nuxt UI's material defaults. Nuxt UI also sets a `light`
        // key, which wins over `default` once color mode adds the `.light` class, so set all three.
        highlight: {
          theme: {
            default: 'github-light',
            light: 'github-light',
            dark: 'github-dark',
          },
        },
      },
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

  compatibilityDate: '2026-03-22',

  llms: {
    domain: 'nuxt-convex.onmax.me',
    title: 'Nuxt Convex',
    description: 'Convex integration docs for Nuxt and Vue.',
    full: {
      title: 'Nuxt Convex',
      description: 'Reference and guides for nuxt-convex and vue-convex.',
    },
  },

  mcp: {
    name: 'Nuxt Convex documentation',
    browserRedirect: '/getting-started',
  },

  routeRules: {
    '/getting-started/introduction': { redirect: '/getting-started' },
    '/vue-core/introduction': { redirect: '/vue-guide' },
    '/vue-core': { redirect: '/vue-guide' },
    '/vue-core/installation': { redirect: '/vue-guide/installation' },
    '/vue-core/manual-initialization': { redirect: '/vue-guide/controller' },
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
