import type { Ref } from 'vue'
import { useConvexRuntimeFacade } from './internal/session/facade'
import { requireRealtimeClient, useConvexRuntimeContext } from './internal/useConvexRuntimeContext'
import { useConvexStorageOptions } from './internal/useConvexStorageOptions'

export interface ConvexStorageReturn {
  generateUploadUrl: () => Promise<string>
  getUrl: (storageId: string) => Ref<string | null>
  remove: (storageId: string) => Promise<void>
}

export function useConvexStorage(): ConvexStorageReturn {
  const context = useConvexRuntimeContext()
  const runtime = useConvexRuntimeFacade()
  const storage = useConvexStorageOptions()

  return {
    async generateUploadUrl() {
      return await requireRealtimeClient(context.clientRef).mutation(storage.generateUploadUrl, {})
    },
    getUrl(storageId) {
      return runtime.liveValue(storage.getUrl, { storageId }, null) as Ref<string | null>
    },
    async remove(storageId) {
      await requireRealtimeClient(context.clientRef).mutation(storage.remove, { storageId })
    },
  }
}
