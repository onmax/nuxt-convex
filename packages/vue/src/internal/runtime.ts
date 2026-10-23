import type { ConvexClientOptions } from 'convex/browser'
import type { FunctionReference } from 'convex/server'
import type { InjectionKey, Ref, ShallowRef } from 'vue'
import type { ConvexHydrationAdapter, Settled } from './hydration'
import { ConvexClient, ConvexHttpClient } from 'convex/browser'
import { shallowReadonly, shallowRef } from 'vue'
import { decodeHydrated, encodeSettled } from './hydration'

export interface ConvexServerAuth {
  /** Returns the JWT for the current request. Called at most once per app instance. */
  getToken: () => Promise<string | null | undefined>
}

export interface ConvexVueOptions {
  url?: string
  clientOptions?: ConvexClientOptions
  /** Run awaited queries during SSR over HTTP. Defaults to `true`. */
  server?: boolean
  /** Transfers SSR query results to the client. Without it the client starts empty. */
  hydration?: ConvexHydrationAdapter
  /** Authenticates SSR queries. Only used on the server; the token is never serialized. */
  serverAuth?: ConvexServerAuth
  /** Auth state known before the client connects (e.g. from SSR), so auth-gated UI renders and hydrates without flipping. */
  initialAuth?: { isAuthenticated: boolean }
}

export interface ResolvedConvexVueOptions extends ConvexVueOptions {
  server: boolean
}

export type ConvexControllerStatus = 'connected' | 'disconnected'

export interface ConvexControllerConnectOptions extends Omit<ConvexVueOptions, 'url'> {
  url: string
}

export interface ConvexVueController {
  options: Readonly<Ref<ResolvedConvexVueOptions>>
  status: Readonly<Ref<ConvexControllerStatus>>
  connect: (options: ConvexControllerConnectOptions) => void
  reconfigure: (options: Partial<ConvexControllerConnectOptions>) => void
  disconnect: () => void
  getClient: () => ConvexClient | undefined
  getHttpClient: () => ConvexHttpClient | undefined
}

export interface ConvexAuthState {
  isLoading: boolean
  isAuthenticated: boolean
}

export const DISCONNECTED_AUTH_STATE: ConvexAuthState = {
  isAuthenticated: false,
  isLoading: false,
}

export interface ConvexRuntimeContext {
  controller: ConvexVueController
  isServer: boolean
  optionsRef: ShallowRef<ResolvedConvexVueOptions>
  statusRef: ShallowRef<ConvexControllerStatus>
  clientRef: ShallowRef<ConvexClient | undefined>
  authStateRef: ShallowRef<ConvexAuthState>
  /** Auth state the server rendered with, if known. */
  initialAuth: ConvexAuthState | undefined
  /** Created on first use, so browsers that never need HTTP don't pay for it. */
  getHttpClient: () => ConvexHttpClient | undefined
  /** Server only: runs a query once per app instance and records it for hydration. */
  fetchServerQuery: (key: string, query: FunctionReference<'query'>, args: Record<string, unknown>, anonymous: boolean) => Promise<Settled | undefined>
  /** Client only: returns the SSR result for `key` while the app is hydrating. */
  readHydrated: (key: string) => Settled | undefined
}

export const CONVEX_VUE_KEY: InjectionKey<ConvexRuntimeContext> = Symbol('vue-convex')

type ConnectableOptions = ResolvedConvexVueOptions & { url: string }

function resolveOptions<Options extends ConvexVueOptions>(options: Options): Options & { server: boolean } {
  return { ...options, server: options.server ?? true }
}

function hasUrl(options: ResolvedConvexVueOptions): options is ConnectableOptions {
  return !!options.url
}

function createHttpClient(options: ConnectableOptions): ConvexHttpClient {
  return new ConvexHttpClient(options.url, {
    logger: options.clientOptions?.logger,
    skipConvexDeploymentUrlCheck: options.clientOptions?.skipConvexDeploymentUrlCheck,
  })
}

function requireUrl(options: ResolvedConvexVueOptions): ConnectableOptions {
  if (!hasUrl(options))
    throw new Error('[vue-convex] reconfigure() requires a configured Convex URL. Use connect({ url }) first.')
  return options
}

export function createConvexRuntimeContext(initialOptions: ConvexVueOptions = {}): ConvexRuntimeContext {
  const isServer = typeof window === 'undefined'
  const optionsRef = shallowRef<ResolvedConvexVueOptions>(resolveOptions(initialOptions))
  const statusRef = shallowRef<ConvexControllerStatus>('disconnected')
  const clientRef = shallowRef<ConvexClient>()
  const initialAuth = initialOptions.initialAuth
    ? { isLoading: false, isAuthenticated: initialOptions.initialAuth.isAuthenticated }
    : undefined
  const authStateRef = shallowRef<ConvexAuthState>(initialAuth ?? { ...DISCONNECTED_AUTH_STATE })

  let httpClient: ConvexHttpClient | undefined
  let authedHttpClient: Promise<ConvexHttpClient> | undefined
  const serverQueries = new Map<string, Promise<Settled | undefined>>()

  const getHttpClient = (): ConvexHttpClient | undefined => {
    const options = optionsRef.value
    if (!httpClient && hasUrl(options))
      httpClient = createHttpClient(options)
    return httpClient
  }

  // Resolve the request token once and keep it on a dedicated client, so the
  // anonymous client stays anonymous for `auth: 'none'` queries.
  const getServerHttpClient = async (anonymous: boolean): Promise<ConvexHttpClient | undefined> => {
    const options = optionsRef.value
    const anonymousClient = getHttpClient()
    if (anonymous || !options.serverAuth || !anonymousClient || !hasUrl(options))
      return anonymousClient

    authedHttpClient ??= options.serverAuth.getToken()
      .catch((error) => {
        console.error('[vue-convex] serverAuth.getToken() failed; running SSR queries anonymously.', error)
        return null
      })
      .then((token) => {
        if (!token)
          return anonymousClient
        const client = createHttpClient(options)
        client.setAuth(token)
        return client
      })
    return await authedHttpClient
  }

  const fetchServerQuery: ConvexRuntimeContext['fetchServerQuery'] = (key, query, args, anonymous) => {
    const dedupeKey = `${anonymous ? 'anon' : 'auth'}|${key}`
    let promise = serverQueries.get(dedupeKey)
    if (!promise) {
      promise = (async () => {
        const client = await getServerHttpClient(anonymous)
        if (!client)
          return undefined
        const settled: Settled = await client.query(query, args).then(
          value => ({ value }),
          error => ({ error: error instanceof Error ? error : new Error(String(error)) }),
        )
        optionsRef.value.hydration?.set(key, encodeSettled(settled))
        return settled
      })()
      serverQueries.set(dedupeKey, promise)
    }
    return promise
  }

  const readHydrated: ConvexRuntimeContext['readHydrated'] = (key) => {
    const hydration = optionsRef.value.hydration
    if (isServer || !hydration?.isHydrating())
      return undefined
    const entry = hydration.get(key)
    return entry ? decodeHydrated(entry) : undefined
  }

  const closeClient = (): void => {
    void clientRef.value?.close()
    clientRef.value = undefined
  }

  const applyConnectedOptions = (nextOptions: ConnectableOptions): void => {
    closeClient()
    optionsRef.value = nextOptions
    httpClient = undefined
    authedHttpClient = undefined
    serverQueries.clear()
    clientRef.value = isServer ? undefined : new ConvexClient(nextOptions.url, nextOptions.clientOptions)
    statusRef.value = 'connected'
  }

  const controller: ConvexVueController = {
    options: shallowReadonly(optionsRef),
    status: shallowReadonly(statusRef),
    connect(options) {
      applyConnectedOptions(resolveOptions({ ...optionsRef.value, ...options }))
    },
    reconfigure(options) {
      applyConnectedOptions(requireUrl(resolveOptions({ ...optionsRef.value, ...options })))
    },
    disconnect() {
      closeClient()
      optionsRef.value = { ...optionsRef.value, url: undefined }
      httpClient = undefined
      authedHttpClient = undefined
      authStateRef.value = { ...DISCONNECTED_AUTH_STATE }
      statusRef.value = 'disconnected'
    },
    getClient: () => clientRef.value,
    getHttpClient,
  }

  const startOptions = optionsRef.value
  if (hasUrl(startOptions))
    applyConnectedOptions(startOptions)

  return {
    controller,
    isServer,
    optionsRef,
    statusRef,
    clientRef,
    authStateRef,
    initialAuth,
    getHttpClient,
    fetchServerQuery,
    readHydrated,
  }
}
