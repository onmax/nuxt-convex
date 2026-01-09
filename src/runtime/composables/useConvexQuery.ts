import type { ConvexClient } from 'convex/browser'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { useAsyncData, useNuxtApp, useRuntimeConfig } from '#imports'
import { CONVEX_INJECTION_KEY } from '@convex-vue/core'
import { inject, onScopeDispose, ref, toValue, watch } from 'vue'

type QueryReference = FunctionReference<'query'>

interface SubscriptionState<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  pending: Ref<boolean>
  status: Ref<'idle' | 'pending' | 'success' | 'error'>
}

export interface UseConvexQueryOptions<T> extends Omit<AsyncDataOptions<T>, 'transform' | 'default'> {
  /**
   * Enable server-side data fetching.
   * @default true
   */
  ssr?: boolean
}

/**
 * Convex query composable with SSR support.
 *
 * By default, fetches data on the server (SSR) and subscribes to real-time updates on the client.
 * Set `ssr: false` to disable server-side fetching and use client-only mode.
 *
 * @example
 * ```vue
 * <script setup>
 * // SSR + real-time (default)
 * const { data, pending, error } = await useConvexQuery(api.tasks.list, {})
 *
 * // Client-only mode
 * const { data } = await useConvexQuery(api.tasks.list, {}, { ssr: false })
 * </script>
 * ```
 */
export async function useConvexQuery<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options: UseConvexQueryOptions<FunctionReturnType<Query>> = {},
): Promise<AsyncData<FunctionReturnType<Query> | null, Error | null>> {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const convexUrl = (config.public.convex as { url?: string })?.url

  // IMPORTANT: inject() must be called synchronously during setup, before any await
  const client = import.meta.client ? inject(CONVEX_INJECTION_KEY) : null

  if (!convexUrl) {
    console.warn('[nuxt-convex] No Convex URL configured')
    return createErrorAsyncData(new Error('Convex URL not configured'))
  }

  const ssrEnabled = options.ssr ?? true
  const shouldUseSSR = ssrEnabled && (import.meta.server || nuxtApp.isHydrating)

  if (shouldUseSSR) {
    return useConvexQuerySSR(query, args, options, convexUrl, client)
  }

  return useConvexQueryClient(query, args, client)
}

/**
 * SSR implementation - fetches on server, subscribes on client
 */
async function useConvexQuerySSR<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options: UseConvexQueryOptions<FunctionReturnType<Query>>,
  convexUrl: string,
  client: ConvexClient | null | undefined,
): Promise<AsyncData<FunctionReturnType<Query> | null, Error | null>> {
  // Convex FunctionReference has _name for stable cache keys
  const queryName = (query as unknown as { _name?: string })._name ?? 'unknown'
  const sortedArgs = sortObjectKeys(toValue(args))
  const key = `convex:${queryName}:${JSON.stringify(sortedArgs)}`

  const asyncData = await useAsyncData(
    key,
    async () => {
      const { fetchQuery } = await import('convex/nextjs')
      return fetchQuery(query, toValue(args), { url: convexUrl })
    },
    { ...options, server: options.ssr ?? true },
  )

  if (import.meta.client) {
    setupClientSubscription(query, args, {
      data: asyncData.data as Ref<FunctionReturnType<Query> | null>,
      error: asyncData.error as Ref<Error | null>,
      pending: asyncData.pending,
      status: asyncData.status as Ref<'idle' | 'pending' | 'success' | 'error'>,
    }, client)
  }

  return asyncData
}

/**
 * Client-only implementation - no server fetch, just real-time subscription
 */
function useConvexQueryClient<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  client: ConvexClient | null | undefined,
): AsyncData<FunctionReturnType<Query> | null, Error | null> {
  const data = ref<FunctionReturnType<Query> | null>(null)
  const error = ref<Error | null>(null)
  const pending = ref(true)
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('pending')

  const state: SubscriptionState<FunctionReturnType<Query>> = { data, error, pending, status }
  const { refresh } = setupClientSubscription(query, args, state, client)

  return {
    data,
    pending,
    error,
    status,
    refresh,
    execute: refresh,
    clear: () => {
      data.value = null
      error.value = null
      pending.value = false
      status.value = 'idle'
    },
  } as AsyncData<FunctionReturnType<Query> | null, Error | null>
}

/**
 * Set up real-time subscription on client.
 * Client must be passed in (injected before any await in the parent).
 */
function setupClientSubscription<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  state: SubscriptionState<FunctionReturnType<Query>>,
  client: ConvexClient | null | undefined,
): { refresh: () => Promise<void> } {
  if (!client) {
    console.warn('[nuxt-convex] Convex client not found. Real-time updates disabled.')
    state.pending.value = false
    state.status.value = 'error'
    state.error.value = new Error('Convex client not found')
    return { refresh: async () => {} }
  }

  let unsubscribe: (() => void) | null = null

  const subscribe = (): void => {
    unsubscribe?.()
    const currentArgs = toValue(args)
    unsubscribe = client.onUpdate(query, currentArgs, (result) => {
      if (result !== undefined) {
        state.data.value = result as FunctionReturnType<Query>
        state.pending.value = false
        state.status.value = 'success'
      }
    })
  }

  subscribe()
  watch(() => toValue(args), subscribe, { deep: true })
  onScopeDispose(() => unsubscribe?.())

  return {
    refresh: async () => {
      state.pending.value = true
      subscribe()
    },
  }
}

/**
 * Create an AsyncData object for error cases
 */
function createErrorAsyncData<Query extends QueryReference>(
  err: Error,
): AsyncData<FunctionReturnType<Query> | null, Error | null> {
  return {
    data: ref(null),
    pending: ref(false),
    error: ref(err),
    status: ref('error'),
    refresh: async () => {},
    execute: async () => {},
    clear: () => {},
  } as AsyncData<FunctionReturnType<Query> | null, Error | null>
}

/**
 * Recursively sorts object keys for stable JSON serialization
 */
function sortObjectKeys<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object')
    return obj
  if (Array.isArray(obj))
    return obj.map(sortObjectKeys) as T
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key])
  }
  return sorted as T
}
