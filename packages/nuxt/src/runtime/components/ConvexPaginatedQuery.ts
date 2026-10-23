import type { FunctionArgs, FunctionReference, FunctionReturnType, PaginationOptions, PaginationResult } from 'convex/server'
import type { PropType, SetupContext, SlotsType, VNodeChild } from 'vue'
import type { ConvexQueryError, UseConvexPaginatedQueryOptions } from 'vue-convex'
import { defineComponent } from 'vue'
import { useConvexPaginatedQuery } from '#convex'

type PaginatedQueryReference = FunctionReference<'query', 'public', { paginationOpts: PaginationOptions }, PaginationResult<any>>
type Item<Query extends PaginatedQueryReference> = FunctionReturnType<Query> extends PaginationResult<infer T> ? T : never

export interface ConvexPaginatedQueryProps<Query extends PaginatedQueryReference> {
  query: Query
  args?: Omit<FunctionArgs<Query>, 'paginationOpts'> | 'skip'
  /** Read once, at setup. Defaults to `{ numItems: 10 }`. */
  options?: UseConvexPaginatedQueryOptions
  /** Wait for the first page before rendering, on the client too. The server always waits unless `options.server` is false. */
  suspense?: boolean
}

export type ConvexPaginatedQuerySlots = SlotsType<{
  default: (props: {
    data: Item<PaginatedQueryReference>[]
    isLoadingMore: boolean
    isDone: boolean
    loadMore: (numItems?: number) => boolean
    reset: () => void
  }) => VNodeChild
  loading: () => VNodeChild
  error: (props: { error: ConvexQueryError, reset: () => void }) => VNodeChild
  empty: () => VNodeChild
}>

export default defineComponent(<Query extends PaginatedQueryReference>(props: ConvexPaginatedQueryProps<Query>, { slots }: SetupContext<Record<never, never>, ConvexPaginatedQuerySlots>) => {
  const state = useConvexPaginatedQuery(
    () => props.query,
    // SAFETY: omitted args become `{}`, and Convex validates the args against the query on the server.
    () => props.args ?? ({} as Omit<FunctionArgs<Query>, 'paginationOpts'>),
    props.options ?? { numItems: 10 },
  )

  const render = (): VNodeChild => {
    if (state.isPending.value)
      return slots.loading?.()
    if (state.error.value)
      return slots.error?.({ error: state.error.value, reset: state.reset })
    if (state.data.value.length === 0)
      return slots.empty?.()
    return slots.default?.({
      data: state.data.value,
      isLoadingMore: state.isLoadingMore.value,
      isDone: state.isDone.value,
      loadMore: state.loadMore,
      reset: state.reset,
    })
  }

  const shouldWait = props.suspense || (import.meta.server && props.options?.server !== false)
  return shouldWait ? Promise.resolve(state).then(() => render) : render
}, {
  name: 'ConvexPaginatedQuery',
  // SAFETY: `slots` only feeds type inference; Vue never reads its runtime value.
  slots: Object as ConvexPaginatedQuerySlots,
  // SAFETY: `as any` keeps defineComponent on the generic setup overload, so the setup signature types the props; these are loose runtime checks.
  props: {
    query: { type: Object as PropType<PaginatedQueryReference>, required: true },
    args: { type: [Object, String] as PropType<Record<string, unknown> | 'skip'>, default: undefined },
    options: { type: Object as PropType<UseConvexPaginatedQueryOptions>, default: undefined },
    suspense: { type: Boolean, default: false },
  } as any,
})
