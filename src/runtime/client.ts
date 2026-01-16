import type { ConvexClient } from 'convex/browser'
import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { Ref } from 'vue'
import { inject, onScopeDispose, ref, toValue, watch } from 'vue'

export const CONVEX_INJECTION_KEY: InjectionKey<ConvexClient> = Symbol('convex-client')

type InjectionKey<T> = symbol & { __type?: T }

export function getConvexClient(): ConvexClient {
  const client = inject(CONVEX_INJECTION_KEY)
  if (!client)
    throw new Error('[nuxt-convex] Convex client not found. Is the plugin installed?')
  return client
}

type QueryReference = FunctionReference<'query'>

/**
 * Simple sync query composable for internal use (e.g., storage).
 * Returns reactive data ref that updates in real-time.
 */
export function useSimpleQuery<Query extends QueryReference>(query: Query, args: () => FunctionArgs<Query>): { data: Ref<FunctionReturnType<Query> | null> } {
  const client = inject(CONVEX_INJECTION_KEY)
  const data = ref<FunctionReturnType<Query> | null>(null) as Ref<FunctionReturnType<Query> | null>

  if (!client) {
    console.warn('[nuxt-convex] Convex client not found. Real-time updates disabled.')
    return { data }
  }

  let unsubscribe: (() => void) | null = null

  const subscribe = (): void => {
    unsubscribe?.()
    unsubscribe = client.onUpdate(query, toValue(args()), (result) => {
      if (result !== undefined)
        data.value = result as FunctionReturnType<Query>
    })
  }

  subscribe()
  watch(args, subscribe, { deep: true })
  onScopeDispose(() => unsubscribe?.())

  return { data }
}
