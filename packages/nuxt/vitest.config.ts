import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const alias = {
  '#nuxt-convex/advanced-runtime': fileURLToPath(new URL('../vue/src/advanced.ts', import.meta.url)),
  '#nuxt-convex/storage-runtime': fileURLToPath(new URL('../vue/src/storage.ts', import.meta.url)),
}

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      {
        resolve: { alias },
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.{test,spec}.ts'],
          environment: 'node',
          testTimeout: 60000,
          hookTimeout: 60000,
        },
      },
    ],
  },
})
