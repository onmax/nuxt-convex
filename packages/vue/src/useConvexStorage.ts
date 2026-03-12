import type { Ref } from 'vue'
import { readonly, ref } from 'vue'
import { useConvexContext } from './internal/useConvexContext'
import { useRealtimeQuery } from './internal/useRealtimeQuery'
import { useConvexClient } from './useConvexClient'

export interface ConvexStorageReturn {
  generateUploadUrl: () => Promise<string>
  getUrl: (storageId: string) => Ref<string | null>
  remove: (storageId: string) => Promise<void>
}

export function useConvexStorage(): ConvexStorageReturn {
  const client = useConvexClient()
  const context = useConvexContext()
  const storage = context.options.value.storage

  if (!storage) {
    console.warn('[convex-vue] Storage is not configured')
  }

  return {
    async generateUploadUrl() {
      if (!storage?.generateUploadUrl)
        throw new Error('[convex-vue] Storage generateUploadUrl function is not configured')

      return await client.mutation(storage.generateUploadUrl, {})
    },
    getUrl(storageId) {
      if (!storage?.getUrl)
        return readonly(ref<string | null>(null))

      const { data } = useRealtimeQuery(storage.getUrl, () => ({ storageId }))
      return readonly(data) as Ref<string | null>
    },
    async remove(storageId) {
      if (!storage?.remove)
        throw new Error('[convex-vue] Storage remove function is not configured')

      await client.mutation(storage.remove, { storageId })
    },
  }
}
