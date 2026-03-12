import type { ConvexClient, ConvexClientOptions, ConvexHttpClient } from 'convex/browser'
import type { FunctionReference } from 'convex/server'
import type { InjectionKey, Ref, ShallowRef } from 'vue'

export interface ConvexAuthOptions {
  forceRefreshToken?: boolean
}

export interface ConvexStorageReferences {
  generateUploadUrl: FunctionReference<'mutation'>
  getUrl: FunctionReference<'query'>
  remove: FunctionReference<'mutation'>
}

export interface ConvexVueOptions {
  url: string
  clientOptions?: ConvexClientOptions
  auth?: ConvexAuthOptions
  manualInit?: boolean
  server?: boolean
  storage?: ConvexStorageReferences
}

export interface ResolvedConvexVueOptions extends ConvexVueOptions {
  server: boolean
}

export interface ConvexVueContext {
  options: Ref<ResolvedConvexVueOptions>
  clientRef: ShallowRef<ConvexClient | undefined>
  httpClientRef: ShallowRef<ConvexHttpClient | undefined>
  initClient: (options?: ConvexVueOptions) => void
}

export const CONVEX_VUE_KEY: InjectionKey<ConvexVueContext> = Symbol('onmax-convex-vue')
