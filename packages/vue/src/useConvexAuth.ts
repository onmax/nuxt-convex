import type { AuthTokenFetcher } from 'convex/browser'
import type { ComputedRef } from 'vue'
import { computed, onScopeDispose, watch } from 'vue'
import { DISCONNECTED_AUTH_STATE } from './internal/runtime'
import { useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

export interface UseConvexAuthOptions {
  fetchToken?: AuthTokenFetcher
}

export interface UseConvexAuthReturn {
  isLoading: ComputedRef<boolean>
  isAuthenticated: ComputedRef<boolean>
}

/**
 * Reads the Convex auth state. Pass `fetchToken` once (usually in a plugin) to
 * authenticate the realtime client; disposing that scope signs the client out.
 */
export function useConvexAuth(options?: UseConvexAuthOptions): UseConvexAuthReturn {
  const context = useConvexRuntimeContext()
  const { clientRef, authStateRef } = context
  const fetchToken = options?.fetchToken

  if (fetchToken && !context.isServer) {
    // With an SSR snapshot, keep it until the client confirms, so hydrated UI doesn't flip to loading.
    let keepSnapshot = !!context.initialAuth
    watch(clientRef, (client, _, onCleanup) => {
      if (!client) {
        authStateRef.value = { ...DISCONNECTED_AUTH_STATE }
        return
      }
      if (!keepSnapshot)
        authStateRef.value = { isLoading: true, isAuthenticated: false }
      keepSnapshot = false

      let isActive = true
      client.setAuth(fetchToken, (isAuthenticated) => {
        if (isActive)
          authStateRef.value = { isLoading: false, isAuthenticated }
      })
      onCleanup(() => {
        isActive = false
      })
    }, { flush: 'sync', immediate: true })

    onScopeDispose(() => {
      const client = clientRef.value
      if (client && !client.disabled)
        client.client.clearAuth()
      authStateRef.value = { ...DISCONNECTED_AUTH_STATE }
    }, true)
  }

  return {
    isLoading: computed(() => authStateRef.value.isLoading),
    isAuthenticated: computed(() => authStateRef.value.isAuthenticated),
  }
}
