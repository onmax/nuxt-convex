import { defineComponent } from 'vue'
import { useConvexAuth } from '../useConvexAuth'

export const ConvexAuthenticated = defineComponent({
  name: 'ConvexAuthenticated',
  setup(_, { slots }) {
    const { isAuthenticated } = useConvexAuth()
    return () => isAuthenticated.value ? slots.default?.() : undefined
  },
})

export const ConvexUnauthenticated = defineComponent({
  name: 'ConvexUnauthenticated',
  setup(_, { slots }) {
    const { isAuthenticated, isLoading } = useConvexAuth()
    return () => !isAuthenticated.value && !isLoading.value ? slots.default?.() : undefined
  },
})

export const ConvexAuthLoading = defineComponent({
  name: 'ConvexAuthLoading',
  setup(_, { slots }) {
    const { isLoading } = useConvexAuth()
    return () => isLoading.value ? slots.default?.() : undefined
  },
})
