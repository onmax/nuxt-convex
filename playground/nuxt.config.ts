import process from 'node:process'
import { getPlaygroundSiteUrl, getPlaygroundWorkerName, isGitHubAuthEnabled } from './utils/playground-env'

const env = process.env

export default defineNuxtConfig({
  modules: ['nuxt-convex', '@nuxt/ui', '@nuxthub/core', '@nuxtjs/better-auth'],

  hub: {},

  icon: {
    customCollections: [{ prefix: 'custom', dir: './app/assets/icons' }],
  },

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      script: [{ 'type': 'module', 'src': 'https://console.vitehub.dev/hosted-comments.js', 'data-vitehub-comments': '902f100b-b905-43da-8857-bc466e238012', 'data-vitehub-repo': 'onmax/nuxt-convex' }],
    },
  },

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

  // Better Auth runs inside Convex (@convex-dev/better-auth). nuxt-convex proxies /api/auth/** to it
  // and turns the session cookie into a Convex token for SSR and server routes.
  auth: {
    clientOnly: true,
    redirects: {
      login: '/',
      guest: '/',
      logout: '/',
    },
  },

  convex: {
    storage: true,
    r2: true,
  },
})
