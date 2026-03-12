import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: ['nuxt', '@nuxt/kit', 'vue', 'convex', '@onmax/convex-vue', '@convex-dev/r2', 'better-auth'],
  failOnWarn: false,
})
