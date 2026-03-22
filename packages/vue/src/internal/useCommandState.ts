import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import { normalizeError } from './useConvexRuntimeContext'

export interface CommandState {
  error: Ref<Error | null>
  isPending: ComputedRef<boolean>
  run: <T>(fn: () => Promise<T>) => Promise<T>
}

export function useCommandState(): CommandState {
  const pendingCount = ref(0)
  const error = ref<Error | null>(null)

  return {
    error,
    isPending: computed(() => pendingCount.value > 0),
    async run<T>(fn: () => Promise<T>): Promise<T> {
      pendingCount.value += 1
      error.value = null
      try {
        return await fn()
      }
      catch (err) {
        error.value = normalizeError(err)
        throw error.value
      }
      finally {
        pendingCount.value -= 1
      }
    },
  }
}
