import type { FunctionReference } from 'convex/server'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { ConvexRuntimeContext } from './runtime'
import { computed, toValue } from 'vue'
import { queryKey } from './hydration'
import { normalizeError } from './useConvexRuntimeContext'

export type QueryStatus = 'idle' | 'pending' | 'success' | 'error'

/**
 * - `optional` (default): run with whatever auth the client has.
 * - `required`: stay idle until authenticated.
 * - `none`: the result doesn't depend on the user, so SSR runs it without fetching a token.
 */
export type QueryAuthMode = 'required' | 'optional' | 'none'

export type QueryTarget
  = | { key: string, args: Record<string, unknown> }
    | { key: string, error: Error }
    | { key: 'skip' }

/** Resolves args into a stable key, so deep-equal args never resubscribe. */
export function useQueryTarget(
  context: ConvexRuntimeContext,
  query: MaybeRefOrGetter<FunctionReference<'query'>>,
  args: MaybeRefOrGetter<Record<string, unknown> | 'skip' | undefined>,
  auth: QueryAuthMode = 'optional',
  suffix = '',
): ComputedRef<QueryTarget> {
  return computed(() => {
    const value = toValue(args) ?? {}
    if (value === 'skip' || (auth === 'required' && !context.authStateRef.value.isAuthenticated))
      return { key: 'skip' }
    try {
      return { key: queryKey(toValue(query), value) + suffix, args: value }
    }
    catch (error) {
      // convexToJson rejects values Convex can't send (Date, class instances, undefined in arrays)
      const normalized = normalizeError(error)
      return { key: `error|${normalized.message}`, error: normalized }
    }
  })
}

/** Promises that settle once a resource leaves `pending`, or once its scope is disposed. */
export function createWaiters(isSettled: () => boolean): { wait: () => Promise<void>, flush: () => void, dispose: () => void } {
  const waiters = new Set<() => void>()
  let disposed = false
  const flush = (): void => {
    for (const resolve of waiters)
      resolve()
    waiters.clear()
  }
  return {
    wait: () => disposed || isSettled() ? Promise.resolve() : new Promise(resolve => waiters.add(resolve)),
    flush,
    dispose() {
      disposed = true
      flush()
    },
  }
}

/** Makes `state` awaitable like `useAsyncData`: `await` resolves to the same refs and never rejects. */
export function makeAwaitable<T extends object>(state: T, ready: () => Promise<void>): T & PromiseLike<T> {
  // Resolve with a copy that has no `then`, or the promise would adopt it forever.
  const plain = { ...state }
  return Object.assign(state, {
    then<R1 = T, R2 = never>(
      onFulfilled?: ((value: T) => R1 | PromiseLike<R1>) | null,
      onRejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
    ): Promise<R1 | R2> {
      return ready().then(() => plain).then(onFulfilled, onRejected)
    },
  })
}
