import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { PropType } from 'vue'
import { computed, defineComponent, watch } from 'vue'
import type { UseConvexQueryOptions } from '../composables/useConvexQuery'
import { useConvexQuery } from '../composables/useConvexQuery'

type QueryReference = FunctionReference<'query'>

function waitForAsyncData(pending: { value: boolean }, error: { value: Error | null }): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!pending.value)
      return resolve()
    const stop = watch([pending, error], ([isPending, err]) => {
      if (err) {
        stop()
        reject(err)
        return
      }
      if (!isPending) {
        stop()
        resolve()
      }
    }, { immediate: true })
  })
}

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
    const asyncData = await useConvexQuery(props.query, argsRef, props.options as UseConvexQueryOptions<FunctionReturnType<QueryReference>> | undefined)
    const isEmpty = computed(() => {
      const value = asyncData.data.value as FunctionReturnType<QueryReference> | null
      return value === null || (Array.isArray(value) && value.length === 0)
    })

    if (props.suspense) {
      await waitForAsyncData(asyncData.pending, asyncData.error)
    }

    return () => {
      if (asyncData.pending.value)
        return slots.loading?.()
      if (asyncData.error.value)
        return slots.error?.({ error: asyncData.error.value })
      if (isEmpty.value)
        return slots.empty?.()
      return slots.default?.({ data: asyncData.data.value })
    }
  },
})
