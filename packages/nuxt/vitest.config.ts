import { fileURLToPath } from 'node:url'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  resolve: {
    alias: {
      '#nuxt-convex/advanced-runtime': fileURLToPath(new URL('../vue/src/advanced.ts', import.meta.url)),
      '#nuxt-convex/storage-runtime': fileURLToPath(new URL('../vue/src/storage.ts', import.meta.url)),
    },
  },
  test: {
    testTimeout: 60000,
    hookTimeout: 60000,
  },
})
