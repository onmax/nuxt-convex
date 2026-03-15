import type { ObjectPlugin } from 'vue'
import type { ConvexVueOptions } from './internal/runtime'
import { createConvexRuntimeContext, CONVEX_VUE_KEY } from './internal/runtime'

export const convexVue: ObjectPlugin<ConvexVueOptions> = {
  install(app, initialOptions = {}) {
    app.provide(CONVEX_VUE_KEY, createConvexRuntimeContext(initialOptions))
  },
}
