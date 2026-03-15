import type { Ref } from 'vue'
import { onScopeDispose, readonly, ref, watch } from 'vue'
import { requireRealtimeClient, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'
import { useConvexStorageOptions } from './internal/useConvexStorageOptions'

export interface ConvexStorageReturn {
  generateUploadUrl: () => Promise<string>
  getUrl: (storageId: string) => Ref<string | null>
  remove: (storageId: string) => Promise<void>
}

export function useConvexStorage(): ConvexStorageReturn {
  const context = useConvexRuntimeContext()
  const storage = useConvexStorageOptions()

  return {
    async generateUploadUrl() {
      return await requireRealtimeClient(context.clientRef).mutation(storage.generateUploadUrl, {})
    },
    getUrl(storageId) {
      const data = ref<string | null>(null)
      let unsubscribe: (() => void) | null = null

      const subscribe = (): void => {
        unsubscribe?.()
        unsubscribe = null

        if (typeof window === 'undefined' || !context.clientRef.value) {
          data.value = null
          return
        }

        unsubscribe = context.clientRef.value.onUpdate(
          storage.getUrl,
          { storageId },
          (result) => {
            data.value = result
          },
          () => {},
        )
      }

      watch(() => context.clientRef.value, subscribe, { immediate: true })
      onScopeDispose(() => unsubscribe?.())
      return readonly(data) as Ref<string | null>
    },
    async remove(storageId) {
      await requireRealtimeClient(context.clientRef).mutation(storage.remove, { storageId })
    },
  }
}
