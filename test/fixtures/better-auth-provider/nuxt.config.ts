import NuxtConvex from '../../../../src/module'
import AssertBetterAuthProvider from './modules/assert-better-auth-provider'

export default defineNuxtConfig({
  modules: [NuxtConvex, AssertBetterAuthProvider],
  convex: {
    url: 'https://test.convex.cloud',
  },
  auth: {
    database: {
      provider: 'convex',
      convexUrl: 'https://override.convex.cloud',
    },
  },
})

