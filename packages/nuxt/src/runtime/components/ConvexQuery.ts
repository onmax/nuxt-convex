import type { FunctionArgs, FunctionReference, FunctionReturnType } from 'convex/server'
import type { PropType, SetupContext, SlotsType, VNodeChild } from 'vue'
import type { ConvexQueryError, UseConvexQueryOptions } from 'vue-convex'
import { defineComponent } from 'vue'
import { useConvexQuery } from '#convex'

type QueryReference = FunctionReference<'query'>

export interface ConvexQueryProps<Query extends QueryReference> {
  query: Query
  args?: FunctionArgs<Query> | 'skip'
  /** Read once, at setup. */
  options?: UseConvexQueryOptions
  /** Wait for the first result before rendering, on the client too. The server always waits unless `options.server` is false. */
  suspense?: boolean
}

export type ConvexQuerySlots = SlotsType<{
  default: (props: { data: FunctionReturnType<QueryReference> }) => VNodeChild
  loading: () => VNodeChild
  error: (props: { error: ConvexQueryError }) => VNodeChild
  empty: () => VNodeChild
}>

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || (Array.isArray(value) && value.length === 0)
}

export default defineComponent(<Query extends QueryReference>(props: ConvexQueryProps<Query>, { slots }: SetupContext<Record<never, never>, ConvexQuerySlots>) => {
  const state = useConvexQuery(() => props.query, () => props.args ?? ({} as FunctionArgs<Query>), props.options)

  const render = (): VNodeChild => {
    if (state.isPending.value)
      return slots.loading?.()
    if (state.error.value)
      return slots.error?.({ error: state.error.value })
    if (isEmpty(state.data.value))
      return slots.empty?.()
    return slots.default?.({ data: state.data.value! })
  }

  // Async only when it has to wait: an async setup outside <Suspense> renders nothing.
  const shouldWait = props.suspense || (import.meta.server && props.options?.server !== false)
  return shouldWait ? Promise.resolve(state).then(() => render) : render
}, {
  name: 'ConvexQuery',
  slots: Object as ConvexQuerySlots,
  props: {
    query: { type: Object as PropType<QueryReference>, required: true },
    args: { type: [Object, String] as PropType<Record<string, unknown> | 'skip'>, default: undefined },
    options: { type: Object as PropType<UseConvexQueryOptions>, default: undefined },
    suspense: { type: Boolean, default: false },
  } as any,
})
