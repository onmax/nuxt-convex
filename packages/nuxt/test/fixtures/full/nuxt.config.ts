import NuxtConvex from '../../../src/module'

export default defineNuxtConfig({
  modules: [NuxtConvex],
  convex: {
    url: 'https://test.convex.cloud',
    storage: true,
    auth: { provider: 'better-auth' },
    clientOptions: { verbose: true },
  },
})
