import type { Ref } from 'vue'
import { onScopeDispose, readonly, ref, watch } from 'vue'
import { useConvexContext } from './internal/useConvexContext'

export interface ConvexStorageReturn {
  generateUploadUrl: () => Promise<string>
  getUrl: (storageId: string) => Ref<string | null>
  remove: (storageId: string) => Promise<void>
}

export function useConvexStorage(): ConvexStorageReturn {
  const context = useConvexContext()
  const storage = context.options.value.storage
  const getClient = (): NonNullable<typeof context.clientRef.value> => {
    if (!context.clientRef.value)
      throw new Error('[convex-vue] Convex client is not initialized')
    return context.clientRef.value
  }

  if (!storage) {
    console.warn('[convex-vue] Storage is not configured')
  }

  return {
    async generateUploadUrl() {
      if (!storage?.generateUploadUrl)
        throw new Error('[convex-vue] Storage generateUploadUrl function is not configured')

      return await getClient().mutation(storage.generateUploadUrl, {})
    },
    getUrl(storageId) {
      if (!storage?.getUrl)
        return readonly(ref<string | null>(null))
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
      if (!storage?.remove)
        throw new Error('[convex-vue] Storage remove function is not configured')

      await getClient().mutation(storage.remove, { storageId })
    },
  }
}
