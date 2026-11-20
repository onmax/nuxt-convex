import type { ConvexStorageOptions } from './storage'
import { inject } from 'vue'
import { errors } from './diagnostics'
import { CONVEX_STORAGE_KEY } from './storage'

export function useConvexStorageOptions(): ConvexStorageOptions {
  const options = inject(CONVEX_STORAGE_KEY)
  if (!options)
    throw errors.VUE_CONVEX_R0006()
  return options
}
