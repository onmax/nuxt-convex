import NuxtConvex from '../../../src/module'

// The e2e test points NUXT_PUBLIC_CONVEX_URL at this app, whose server/api/query.post.ts fakes Convex.
export default defineNuxtConfig({
  modules: [NuxtConvex],
  convex: {
    url: 'http://127.0.0.1:3210',
  },
})
