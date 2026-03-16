import type { AuthTokenFetcher } from 'convex/browser'
import type { ComputedRef } from 'vue'
import { computed, onScopeDispose, watch } from 'vue'
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
    const applyAuth = (client: typeof clientRef.value): void => {
      if (!client)
        return
      authStateRef.value = { isLoading: true, isAuthenticated: false }
      client.setAuth(fetchToken, (isAuthenticated) => {
        authStateRef.value = { isLoading: false, isAuthenticated }
      })
    }
    watch(clientRef, applyAuth, { immediate: true })
    onScopeDispose(() => {
      authStateRef.value = { isLoading: false, isAuthenticated: false }
    })
  }

  return {
    isLoading: computed(() => authStateRef.value.isLoading),
    isAuthenticated: computed(() => authStateRef.value.isAuthenticated),
  }
}
