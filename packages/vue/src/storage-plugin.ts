import type { ObjectPlugin } from 'vue'
import type { ConvexStorageOptions } from './internal/storage'
import { CONVEX_STORAGE_KEY } from './internal/storage'

export const convexVueStorage: ObjectPlugin<ConvexStorageOptions> = {
  install(app, options) {
    app.provide(CONVEX_STORAGE_KEY, options)
  },
}
