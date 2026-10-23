import type { FunctionReference } from 'convex/server'
import type { InjectionKey } from 'vue'

export interface ConvexStorageOptions {
  generateUploadUrl: FunctionReference<'mutation', 'public', any, string>
  getUrl: FunctionReference<'query', 'public', any, string | null>
  remove: FunctionReference<'mutation'>
}

export const CONVEX_STORAGE_KEY: InjectionKey<ConvexStorageOptions> = Symbol('onmax-convex-storage')
