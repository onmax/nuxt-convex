import type { ConvexClientOptions } from 'convex/browser'
import type { DeepReadonly, InjectionKey, Ref, ShallowRef } from 'vue'
import { ConvexClient, ConvexHttpClient } from 'convex/browser'
import { readonly, shallowRef } from 'vue'

export interface ConvexVueOptions {
  url?: string
  clientOptions?: ConvexClientOptions
  server?: boolean
}

export interface ResolvedConvexVueOptions {
  url?: string
  clientOptions?: ConvexClientOptions
  server: boolean
}

export type ConvexControllerStatus = 'connected' | 'disconnected'

export interface ConvexControllerConnectOptions extends Omit<ConvexVueOptions, 'url'> {
  url: string
}

export interface ConvexVueController {
  options: DeepReadonly<Ref<ResolvedConvexVueOptions>>
  status: DeepReadonly<Ref<ConvexControllerStatus>>
  connect: (options: ConvexControllerConnectOptions) => void
  reconfigure: (options: Partial<ConvexControllerConnectOptions>) => void
  disconnect: () => void
  getClient: () => ConvexClient | undefined
  getHttpClient: () => ConvexHttpClient | undefined
}

export interface ConvexRuntimeContext {
  controller: ConvexVueController
  optionsRef: ShallowRef<ResolvedConvexVueOptions>
  statusRef: ShallowRef<ConvexControllerStatus>
  clientRef: ShallowRef<ConvexClient | undefined>
  httpClientRef: ShallowRef<ConvexHttpClient | undefined>
}

export const CONVEX_VUE_KEY: InjectionKey<ConvexRuntimeContext> = Symbol('onmax-convex-vue')

function resolveOptions(options: ConvexVueOptions = {}): ResolvedConvexVueOptions {
  return {
    clientOptions: options.clientOptions,
    server: options.server ?? true,
    url: options.url,
  }
}

function createHttpClient(options: ConvexControllerConnectOptions): ConvexHttpClient {
  return new ConvexHttpClient(options.url, {
    logger: options.clientOptions?.logger,
    skipConvexDeploymentUrlCheck: options.clientOptions?.skipConvexDeploymentUrlCheck,
  })
}

function createRealtimeClient(options: ConvexControllerConnectOptions): ConvexClient | undefined {
  if (typeof window === 'undefined')
    return undefined

  return new ConvexClient(options.url, options.clientOptions)
}

function requireUrl(options: ResolvedConvexVueOptions, action: 'connect' | 'reconfigure'): ConvexControllerConnectOptions {
  if (!options.url) {
    throw new Error(
      action === 'connect'
        ? '[convex-vue] connect() requires a Convex URL'
        : '[convex-vue] reconfigure() requires a configured Convex URL. Use connect({ url }) first.',
    )
  }

  return options as ConvexControllerConnectOptions
}

export function createConvexRuntimeContext(initialOptions: ConvexVueOptions = {}): ConvexRuntimeContext {
  const optionsRef = shallowRef(resolveOptions(initialOptions))
  const statusRef = shallowRef<ConvexControllerStatus>('disconnected')
  const clientRef = shallowRef<ConvexClient>()
  const httpClientRef = shallowRef<ConvexHttpClient>()

  const closeExistingClient = (): void => {
    // ConvexClient exposes close() to tear down the WebSocket
    if (clientRef.value && 'close' in clientRef.value)
      clientRef.value.close()
  }

  const applyConnectedOptions = (nextOptions: ConvexControllerConnectOptions): void => {
    closeExistingClient()
    optionsRef.value = resolveOptions(nextOptions)
    httpClientRef.value = createHttpClient(nextOptions)
    clientRef.value = createRealtimeClient(nextOptions)
    statusRef.value = 'connected'
  }

  const controller: ConvexVueController = {
    options: readonly(optionsRef) as DeepReadonly<Ref<ResolvedConvexVueOptions>>,
    status: readonly(statusRef) as DeepReadonly<Ref<ConvexControllerStatus>>,
    connect(options) {
      applyConnectedOptions(options)
    },
    reconfigure(options) {
      const merged = resolveOptions({
        ...optionsRef.value,
        ...options,
      })

      applyConnectedOptions(requireUrl(merged, 'reconfigure'))
    },
    disconnect() {
      closeExistingClient()
      optionsRef.value = resolveOptions({
        clientOptions: optionsRef.value.clientOptions,
        server: optionsRef.value.server,
      })
      clientRef.value = undefined
      httpClientRef.value = undefined
      statusRef.value = 'disconnected'
    },
    getClient() {
      return clientRef.value
    },
    getHttpClient() {
      return httpClientRef.value
    },
  }

  if (optionsRef.value.url)
    applyConnectedOptions(requireUrl(optionsRef.value, 'connect'))

  return {
    controller,
    optionsRef,
    statusRef,
    clientRef: clientRef as ShallowRef<ConvexClient | undefined>,
    httpClientRef: httpClientRef as ShallowRef<ConvexHttpClient | undefined>,
  }
}
