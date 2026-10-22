import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, toValue } from 'vue'
import { createQueryResource } from './internal/query'
import { requireRealtimeClient, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'
import { useConvexStorageOptions } from './internal/useConvexStorageOptions'

export interface ConvexStorageReturn {
  generateUploadUrl: () => Promise<string>
  /** Live URL of a stored file, `null` while loading or missing. Call in setup: it subscribes in the current scope. */
  getUrl: (storageId: MaybeRefOrGetter<string | null | undefined>) => Readonly<Ref<string | null>>
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
      const { data } = createQueryResource(context, storage.getUrl, () => {
        const id = toValue(storageId)
        return id ? { storageId: id } : 'skip'
      })
      return computed(() => (data.value as string | null | undefined) ?? null)
    },
    async remove(storageId) {
      await requireRealtimeClient(context.clientRef).mutation(storage.remove, { storageId })
    },
  }
}
