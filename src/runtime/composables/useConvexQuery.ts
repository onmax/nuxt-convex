import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { MaybeRefOrGetter } from 'vue'
import { useAsyncData, useNuxtApp, useRuntimeConfig } from '#imports'
import { CONVEX_INJECTION_KEY } from '@convex-vue/core'
import { inject, onScopeDispose, ref, toValue, watch } from 'vue'

type QueryReference = FunctionReference<'query'>

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
 * const { data } = useConvexQuery(api.tasks.list, {}, { ssr: false })
 * </script>
 * ```
 */
export function useConvexQuery<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options: UseConvexQueryOptions<FunctionReturnType<Query>> = {},
): AsyncData<FunctionReturnType<Query> | null, Error | null> | Promise<AsyncData<FunctionReturnType<Query> | null, Error | null>> {
  const nuxtApp = useNuxtApp()
  const config = useRuntimeConfig()
  const convexUrl = (config.public.convex as { url?: string })?.url

  // Determine if SSR should be used
  const ssrEnabled = options.ssr ?? true
  const isServer = import.meta.server
  const shouldUseSSR = ssrEnabled && (isServer || nuxtApp.isHydrating)

  if (shouldUseSSR) {
    return useConvexQuerySSR(query, args, options, convexUrl)
  }

  // Client-only mode - use synchronous approach
  return useConvexQueryClient(query, args, convexUrl)
}

/**
 * SSR implementation - fetches on server, subscribes on client
 */
async function useConvexQuerySSR<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  options: UseConvexQueryOptions<FunctionReturnType<Query>>,
  convexUrl: string | undefined,
): Promise<AsyncData<FunctionReturnType<Query> | null, Error | null>> {
  if (!convexUrl) {
    console.warn('[nuxt-convex] No Convex URL configured')
    return createNullAsyncData<Query>()
  }

  // Stable cache key
  const queryName = (query as any)._name || (query as any).toString?.() || 'unknown'
  const sortedArgs = sortObjectKeys(toValue(args))
  const key = `convex:${queryName}:${JSON.stringify(sortedArgs)}`

  const asyncData = await useAsyncData(
    key,
    async () => {
      const { fetchQuery } = await import('convex/nextjs')
      return fetchQuery(query, toValue(args), { url: convexUrl })
    },
    {
      ...options,
      server: options.ssr ?? true,
    },
  )

  // Set up real-time subscription on client
  if (import.meta.client) {
    setupClientSubscription(query, args, asyncData)
  }

  return asyncData
}

/**
 * Client-only implementation - no server fetch, just real-time subscription
 */
function useConvexQueryClient<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  convexUrl: string | undefined,
): AsyncData<FunctionReturnType<Query> | null, Error | null> {
  if (!convexUrl) {
    console.warn('[nuxt-convex] No Convex URL configured')
    return createNullAsyncData<Query>() as AsyncData<FunctionReturnType<Query> | null, Error | null>
  }

  const data = ref<FunctionReturnType<Query> | null>(null) as AsyncData<FunctionReturnType<Query> | null, Error | null>['data']
  const error = ref<Error | null>(null)
  const pending = ref(true)
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('pending')

  if (import.meta.client) {
    setupClientSubscription(query, args, { data, error, pending, status })
  }

  return {
    data,
    pending,
    error,
    status: status as AsyncData<FunctionReturnType<Query> | null, Error | null>['status'],
    refresh: async () => {},
    execute: async () => {},
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
 * Must be called synchronously during setup phase for inject() to work.
 */
function setupClientSubscription<Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<FunctionArgs<Query>>,
  state: { data: any, error?: any, pending?: any, status?: any },
): void {
  const client = inject(CONVEX_INJECTION_KEY)

  if (!client) {
    console.warn('[nuxt-convex] Convex client not found. Real-time updates disabled.')
    if (state.pending)
      state.pending.value = false
    if (state.status)
      state.status.value = 'error'
    return
  }

  let unsubscribe: (() => void) | null = null

  const setupSubscription = (): void => {
    unsubscribe?.()
    const currentArgs = toValue(args)
    unsubscribe = client.onUpdate(query, currentArgs, (result) => {
      if (result !== undefined) {
        state.data.value = result as FunctionReturnType<Query>
        if (state.pending)
          state.pending.value = false
        if (state.status)
          state.status.value = 'success'
      }
    })
  }

  setupSubscription()

  watch(() => toValue(args), () => setupSubscription(), { deep: true })

  onScopeDispose(() => {
    unsubscribe?.()
  })
}

/**
 * Create a null AsyncData object for error cases
 */
function createNullAsyncData<Query extends QueryReference>(): AsyncData<FunctionReturnType<Query> | null, Error | null> {
  return {
    data: ref(null),
    pending: ref(false),
    error: ref(null),
    status: ref('idle'),
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
