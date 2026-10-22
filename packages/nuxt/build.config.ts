import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: ['nuxt', 'nuxt/server', '@nuxt/kit', 'vue', 'convex', 'vue-convex', '@convex-dev/r2'],
  failOnWarn: false,
})
