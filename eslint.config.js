// @ts-check
import antfu from '@antfu/eslint-config'
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: { standalone: false },
}).prepend(
  antfu({
    type: 'lib',
    typescript: true,
    vue: true,
    formatters: true,
    pnpm: true,
    ignores: ['**/convex/_generated/**'],
  }),
)
