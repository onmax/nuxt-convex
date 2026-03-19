import type { FunctionReference } from 'convex/server'
import { api as generatedApi } from '../../../../playground/convex/_generated/api'

export const api = generatedApi
export const convexUrl = import.meta.env.VITE_CONVEX_URL ?? ''
export const demoUserId = import.meta.env.VITE_CONVEX_USER_ID ?? 'vue-example-user'

export const storageApi = generatedApi._hub.storage as typeof generatedApi._hub.storage & {
  removeByStorageId: FunctionReference<'mutation'>
}
