import type { FunctionArgs, FunctionReference } from 'convex/server'
import type { PropType } from 'vue'
import { computed, defineComponent } from 'vue'
import type { UseConvexPaginatedQueryOptions } from '../composables/useConvexPaginatedQuery'
import { useConvexPaginatedQuery } from '../composables/useConvexPaginatedQuery'

type QueryReference = FunctionReference<'query'>

export default defineComponent({
  name: 'ConvexPaginatedQuery',
  props: {
    query: { type: Object as PropType<QueryReference>, required: true },
    args: { type: Object as PropType<FunctionArgs<QueryReference>>, default: () => ({}) },
    options: { type: Object as PropType<UseConvexPaginatedQueryOptions>, required: true },
    suspense: { type: Boolean, default: false },
  },
  async setup(props, { slots }) {
    const argsRef = computed(() => props.args)
    const {
      data,
      isLoading,
      isLoadingMore,
      isDone,
      loadMore,
      reset,
      pages,
      lastPage,
      error,
      suspense,
    } = useConvexPaginatedQuery(props.query, argsRef, props.options)

    const isEmpty = computed(() => data.value === null || (Array.isArray(data.value) && data.value.length === 0))

    if (props.suspense) {
      await suspense()
    }

    return () => {
      if (isLoading.value)
        return slots.loading?.()
      if (error.value)
        return slots.error?.({ error: error.value, reset })
      if (isEmpty.value)
        return slots.empty?.()
      return slots.default?.({
        data: data.value,
        pages: pages.value,
        lastPage: lastPage.value,
        isLoadingMore: isLoadingMore.value,
        isDone: isDone.value,
        reset,
        loadMore,
      })
    }
  },
})
