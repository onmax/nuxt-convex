import NuxtConvex from '../../../src/module'

export default defineNuxtConfig({
  modules: [NuxtConvex, '@nuxtjs/better-auth'],
  convex: {
    url: 'https://test.convex.cloud',
  },
  auth: {
    clientOnly: true,
  },
})
