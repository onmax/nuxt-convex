import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { PropType } from 'vue'
import type { UseConvexQueryOptions } from 'vue-convex'
import { useConvexQuery } from '#convex'
import { computed, defineComponent } from 'vue'

type QueryReference = FunctionReference<'query'>

export default defineComponent({
  name: 'ConvexQuery',
  props: {
    query: { type: Object as PropType<QueryReference>, required: true },
    args: { type: Object as PropType<FunctionArgs<QueryReference>>, default: () => ({}) },
    options: { type: Object as PropType<UseConvexQueryOptions<unknown>> },
    suspense: { type: Boolean, default: false },
  },
  async setup(props, { slots }) {
    const argsRef = computed(() => props.args)
    const state = useConvexQuery(props.query, argsRef, props.options as UseConvexQueryOptions | undefined)
    const isEmpty = computed(() => {
      const value = state.data.value as FunctionReturnType<QueryReference> | undefined
      return value === undefined || (Array.isArray(value) && value.length === 0)
    })
    const shouldAwaitServerData = props.suspense || (typeof window === 'undefined' && (props.options?.server ?? true))

    if (shouldAwaitServerData)
      await state.suspense()

    return () => {
      if (state.isPending.value)
        return slots.loading?.()
      if (state.error.value)
        return slots.error?.({ error: state.error.value })
      if (isEmpty.value)
        return slots.empty?.()
      return slots.default?.({ data: state.data.value })
    }
  },
})
