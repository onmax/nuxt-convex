import NuxtConvex from '../../../src/module'

export default defineNuxtConfig({
  modules: [NuxtConvex],
  alias: {
    '@onmax/convex-vue': '/Users/maxi/nuxt/convex/packages/vue/src/index.ts',
  },
  convex: {
    url: 'https://test.convex.cloud',
    storage: true,
  },
})
