import type { FunctionReference, FunctionReturnType } from 'convex/server'
import type { MaybeRefOrGetter } from 'vue'
import type { UseConvexQueryOptions, UseConvexQueryReturn } from '../useConvexQuery'
import type { Settled } from './hydration'
import type { QueryStatus } from './resource'
import type { ConvexRuntimeContext } from './runtime'
import { getFunctionName } from 'convex/server'
import { computed, onScopeDispose, shallowReadonly, shallowRef, toValue, watch } from 'vue'
import { createWaiters, makeAwaitable, useQueryTarget } from './resource'
import { normalizeError } from './useConvexRuntimeContext'

type QueryReference = FunctionReference<'query'>

export function createQueryResource<Query extends QueryReference>(
  context: ConvexRuntimeContext,
  query: MaybeRefOrGetter<Query>,
  args: MaybeRefOrGetter<Record<string, unknown> | 'skip' | undefined>,
  options: UseConvexQueryOptions = {},
): UseConvexQueryReturn<Query> & PromiseLike<UseConvexQueryReturn<Query>> {
  type Result = FunctionReturnType<Query>
  const data = shallowRef<Result>()
  const error = shallowRef<Error | null>(null)
  const status = shallowRef<QueryStatus>('pending')
  const target = useQueryTarget(context, query, args, options.auth)
  const waiters = createWaiters(() => status.value !== 'pending')

  const settle = (settled: Settled): void => {
    if ('value' in settled) {
      data.value = settled.value
      error.value = null
      status.value = 'success'
    }
    else {
      data.value = undefined
      error.value = settled.error
      status.value = 'error'
    }
    waiters.flush()
  }

  const idle = (): void => {
    data.value = undefined
    error.value = null
    status.value = 'idle'
    waiters.flush()
  }

  const ready = context.isServer ? createServerReady() : createClientReady()

  function createServerReady(): () => Promise<void> {
    const initial = target.value
    if ('error' in initial)
      settle(initial)
    else if (!('args' in initial))
      idle()

    return async () => {
      const current = target.value
      const enabled = options.server ?? context.optionsRef.value.server
      if (!enabled || status.value !== 'pending' || !('args' in current))
        return
      const settled = await context.fetchServerQuery(current.key, toValue(query), current.args, options.auth === 'none')
      if (settled && target.value.key === current.key)
        settle(settled)
    }
  }

  function createClientReady(): () => Promise<void> {
    let unsubscribe: (() => void) | undefined
    let version = 0
    let previousKey: string | undefined

    const readCache = (args: Record<string, unknown>): Settled | undefined => {
      try {
        const value = context.clientRef.value?.client.localQueryResult(getFunctionName(toValue(query)), args as any)
        return value === undefined ? undefined : { value }
      }
      catch {
        return undefined
      }
    }

    // A getter, not the shallowRef itself: shallowRef sources force the watcher to fire on every change.
    watch([() => target.value.key, () => context.clientRef.value], ([key, client]) => {
      const current = target.value
      const isFirstRun = previousKey === undefined
      const keyChanged = previousKey !== key
      previousKey = key
      const stop = unsubscribe
      unsubscribe = undefined
      const runVersion = ++version

      if (!('args' in current)) {
        stop?.()
        if ('error' in current)
          settle(current)
        else
          idle()
        return
      }

      if (keyChanged) {
        const seeded = (isFirstRun && context.readHydrated(key)) || readCache(current.args)
        if (seeded) {
          settle(seeded)
        }
        else {
          if (!options.keepPreviousData) {
            data.value = undefined
            error.value = null
          }
          status.value = 'pending'
        }
      }

      if (client) {
        try {
          unsubscribe = client.onUpdate(
            toValue(query),
            current.args as any,
            value => runVersion === version && settle({ value }),
            err => runVersion === version && settle({ error: normalizeError(err) }),
          )
        }
        catch (err) {
          settle({ error: normalizeError(err) })
        }
      }
      // Subscribe first so a shared query is never torn down and re-run in between.
      stop?.()
    }, { immediate: true })

    onScopeDispose(() => {
      unsubscribe?.()
      unsubscribe = undefined
      version++
      waiters.dispose()
    }, true)

    return waiters.wait
  }

  const state: UseConvexQueryReturn<Query> = {
    data: shallowReadonly(data),
    error: shallowReadonly(error),
    status: shallowReadonly(status),
    isPending: computed(() => status.value === 'pending'),
    isSkipped: computed(() => status.value === 'idle'),
    suspense: () => ready().then(() => {
      if (error.value)
        throw error.value
      return data.value
    }),
  }

  return makeAwaitable(state, ready)
}
