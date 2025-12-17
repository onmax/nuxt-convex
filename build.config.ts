import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: ['nuxt', '@nuxt/kit', 'vue'],
  failOnWarn: false,
})
