import type { ComputedRef } from 'vue'
import type { ConvexAuthState } from '../internal/runtime'
import { computed, defineComponent, onMounted, shallowRef } from 'vue'
import { useConvexRuntimeContext } from '../internal/useConvexRuntimeContext'

/**
 * Until mounted, render the auth state the server rendered with (or nothing when
 * it's unknown), so hydration matches. Afterwards follow the live state.
 */
function useRenderedAuthState(): ComputedRef<ConvexAuthState | undefined> {
  const { authStateRef, initialAuth } = useConvexRuntimeContext()
  const isMounted = shallowRef(false)
  onMounted(() => {
    isMounted.value = true
  })
  return computed(() => isMounted.value ? authStateRef.value : initialAuth)
}

export const ConvexAuthenticated = defineComponent({
  name: 'ConvexAuthenticated',
  setup(_, { slots }) {
    const state = useRenderedAuthState()
    return () => state.value?.isAuthenticated ? slots.default?.() : undefined
  },
})

export const ConvexUnauthenticated = defineComponent({
  name: 'ConvexUnauthenticated',
  setup(_, { slots }) {
    const state = useRenderedAuthState()
    return () => state.value && !state.value.isAuthenticated && !state.value.isLoading ? slots.default?.() : undefined
  },
})

export const ConvexAuthLoading = defineComponent({
  name: 'ConvexAuthLoading',
  setup(_, { slots }) {
    const state = useRenderedAuthState()
    return () => state.value?.isLoading ? slots.default?.() : undefined
  },
})
