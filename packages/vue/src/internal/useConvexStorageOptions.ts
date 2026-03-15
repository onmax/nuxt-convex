import type { ConvexStorageOptions } from './storage'
import { inject } from 'vue'
import { CONVEX_STORAGE_KEY } from './storage'

export function useConvexStorageOptions(): ConvexStorageOptions {
  const options = inject(CONVEX_STORAGE_KEY)
  if (!options)
    throw new Error('[convex-vue/storage] Storage feature is not configured. Install convexVueStorage first.')
  return options
}
