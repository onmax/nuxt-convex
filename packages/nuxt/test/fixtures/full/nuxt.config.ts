import NuxtConvex from '../../../src/module'

export default defineNuxtConfig({
  modules: [NuxtConvex],
  convex: {
    url: 'https://test.convex.cloud',
    storage: true,
  },
})
