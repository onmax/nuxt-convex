import NuxtConvex from '../../../src/module'

export default defineNuxtConfig({
  extends: ['../layered-base'],
  modules: [NuxtConvex],
  convex: {
    url: 'https://layered.convex.cloud',
    storage: true,
  },
})
