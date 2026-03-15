import process from 'node:process'
import NuxtConvex from '../packages/nuxt/src/module'
import { getPlaygroundSiteUrl, getPlaygroundWorkerName, isGitHubAuthEnabled } from './utils/playground-env'

const siteUrl = getPlaygroundSiteUrl()
const workerName = getPlaygroundWorkerName()
const enableGitHubAuth = isGitHubAuthEnabled()

export default defineNuxtConfig({
  modules: [NuxtConvex, 'nuxt-skill-hub', '@nuxt/ui', '@nuxthub/core', '@onmax/nuxt-better-auth'],

  alias: {
    '@onmax/convex-vue': '../packages/vue/src/index.ts',
  },

  hub: {},

  skillHub: {
    skillName: 'nuxt',
    targets: ['codex'],
  },

  icon: {
    customCollections: [{ prefix: 'custom', dir: './app/assets/icons' }],
  },

  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    github: {
      clientId: enableGitHubAuth ? process.env.NUXT_GITHUB_CLIENT_ID || '' : '',
      clientSecret: enableGitHubAuth ? process.env.NUXT_GITHUB_SECRET || '' : '',
    },
    public: {
      enableGitHubAuth,
      siteUrl,
    },
  },
  compatibilityDate: '2025-01-01',

  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      nodeCompat: true,
      wrangler: {
        name: workerName,
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
    server: false,
    storage: true,
    r2: true,
  },
})
