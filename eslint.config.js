// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: {
    tooling: true,
    stylistic: {
      quoteProps: 'as-needed',
      commaDangle: 'always-multiline',
      braceStyle: '1tbs',
    },
  },
  dirs: {
    src: ['./playground'],
  },
}).overrideRules({
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none', argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  'vue/max-attributes-per-line': 'off',
  'vue/multi-word-component-names': 'off',
})
