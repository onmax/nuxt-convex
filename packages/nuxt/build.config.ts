import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: ['nuxt', '@nuxt/kit', 'vue', 'convex', '@onmax/convex-vue'],
  failOnWarn: false,
})
