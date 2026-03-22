import { defineComponent } from 'vue'
import { useConvexAuth } from '../useConvexAuth'

const isServer = typeof window === 'undefined'

export const ConvexAuthenticated = defineComponent({
  name: 'ConvexAuthenticated',
  setup(_, { slots }) {
    const { isAuthenticated } = useConvexAuth()
    return () => !isServer && isAuthenticated.value ? slots.default?.() : undefined
  },
})

export const ConvexUnauthenticated = defineComponent({
  name: 'ConvexUnauthenticated',
  setup(_, { slots }) {
    const { isAuthenticated, isLoading } = useConvexAuth()
    return () => !isServer && !isAuthenticated.value && !isLoading.value ? slots.default?.() : undefined
  },
})

export const ConvexAuthLoading = defineComponent({
  name: 'ConvexAuthLoading',
  setup(_, { slots }) {
    const { isLoading } = useConvexAuth()
    return () => !isServer && isLoading.value ? slots.default?.() : undefined
  },
})
