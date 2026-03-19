import type { ObjectPlugin } from 'vue'
import type { ConvexVueOptions } from './internal/runtime'
import { CONVEX_VUE_KEY, createConvexRuntimeContext } from './internal/runtime'

export const convexVue: ObjectPlugin<ConvexVueOptions> = {
  install(app, initialOptions = {}) {
    app.provide(CONVEX_VUE_KEY, createConvexRuntimeContext(initialOptions))
  },
}
