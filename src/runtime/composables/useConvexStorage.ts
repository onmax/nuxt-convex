import { readonly, ref, type Ref } from '#imports'
import { useConvexMutation, useConvexQuery } from '@convex-vue/core'
import type { FunctionReference } from 'convex/server'

interface StorageApi {
  _hub?: {
    storage?: {
      generateUploadUrl: FunctionReference<'mutation'>
      getUrl: FunctionReference<'query'>
      remove: FunctionReference<'mutation'>
    }
  }
}

/**
 * Composable for Convex file storage operations.
 * Requires convex/_hub/storage.ts functions (auto-scaffolded by module).
 * @param api - The Convex API from `~/convex/_generated/api`
 */
export function useConvexStorage(api: StorageApi) {
  const storage = api?._hub?.storage

  if (!storage) {
    console.warn('[nuxt-convex] Storage API not found. Ensure convex/_hub/storage.ts exists and `npx convex dev` is running.')
  }

  return {
    /**
     * Generate a URL for uploading files directly to Convex storage.
     */
    generateUploadUrl: storage?.generateUploadUrl
      ? useConvexMutation(storage.generateUploadUrl)
      : { mutate: () => Promise.reject(new Error('[nuxt-convex] Storage API not configured')) },

    /**
     * Get the public URL for a stored file.
     */
    getUrl: (storageId: string) => {
      if (!storage?.getUrl) {
        return readonly(ref<string | null>(null))
      }
      const { data } = useConvexQuery(storage.getUrl, { storageId })
      return readonly(data) as Ref<string | null>
    },

    /**
     * Delete a file from storage.
     */
    remove: storage?.remove
      ? useConvexMutation(storage.remove)
      : { mutate: () => Promise.reject(new Error('[nuxt-convex] Storage API not configured')) },
  }
}
