import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    testTimeout: 60000,
    hookTimeout: 60000,
  },
})
