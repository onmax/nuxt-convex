import type { ObjectPlugin } from 'vue'
import type { ConvexVueOptions } from './internal/runtime'
import { CONVEX_VUE_KEY, createConvexRuntimeContext } from './internal/runtime'

export const convexVue: ObjectPlugin<ConvexVueOptions> = {
  install(app, options = {}) {
    const context = createConvexRuntimeContext(options)
    app.provide(CONVEX_VUE_KEY, context)
    app.onUnmount(() => context.controller.disconnect())
  },
}
