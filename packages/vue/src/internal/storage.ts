import type { FunctionReference } from 'convex/server'
import type { InjectionKey } from 'vue'

export interface ConvexStorageOptions {
  generateUploadUrl: FunctionReference<'mutation'>
  getUrl: FunctionReference<'query'>
  remove: FunctionReference<'mutation'>
}

export const CONVEX_STORAGE_KEY: InjectionKey<ConvexStorageOptions> = Symbol('onmax-convex-storage')
