// @ts-check
import antfu from '@antfu/eslint-config'
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: { standalone: false },
}).prepend(
  antfu({
    type: 'lib',
    // Preserve the existing wrapping style when upgrading the shared config.
    rules: { 'antfu/reasonable-newline': 'off' },
    typescript: true,
    vue: true,
    formatters: true,
    pnpm: true,
    ignores: ['.artifacts/**', '.codex/**', '**/.nuxt/**', '**/.output/**', '**/convex/_generated/**'],
  }),
  {
    files: ['package.json'],
    rules: {
      'pnpm/json-enforce-catalog': 'off',
    },
  },
)
