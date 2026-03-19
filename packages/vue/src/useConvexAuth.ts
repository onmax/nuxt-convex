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

export function useConvexAuth(options?: UseConvexAuthOptions): UseConvexAuthReturn {
  const { clientRef, authStateRef } = useConvexRuntimeContext()

  if (options?.fetchToken) {
    const fetchToken = options.fetchToken
    watch(clientRef, (client, _, onCleanup) => {
      authStateRef.value = { ...DISCONNECTED_AUTH_STATE }
      if (!client)
        return

      let isActive = true
      authStateRef.value = { isLoading: true, isAuthenticated: false }
      client.setAuth(fetchToken, (isAuthenticated) => {
        if (!isActive)
          return
        authStateRef.value = { isLoading: false, isAuthenticated }
      })
      onCleanup(() => {
        isActive = false
      })
    }, { flush: 'sync', immediate: true })
    onScopeDispose(() => {
      authStateRef.value = { ...DISCONNECTED_AUTH_STATE }
    })
  }

  return {
    isLoading: computed(() => authStateRef.value.isLoading),
    isAuthenticated: computed(() => authStateRef.value.isAuthenticated),
  }
}
