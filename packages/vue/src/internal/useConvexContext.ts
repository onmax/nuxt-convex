import type { ConvexVueContext } from './context'
import { inject } from 'vue'
import { CONVEX_VUE_KEY } from './context'

export function useConvexContext(): ConvexVueContext {
  const context = inject(CONVEX_VUE_KEY)
  if (!context)
    throw new Error('[convex-vue] Convex plugin context not found')
  return context
}
