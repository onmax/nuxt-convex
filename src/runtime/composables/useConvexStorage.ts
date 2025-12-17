import type { Ref } from '#imports'
import type { FunctionReference } from 'convex/server'
import { readonly, ref } from '#imports'
import { useConvexMutation, useConvexQuery } from '@convex-vue/core'

export interface ConvexStorageApi {
  _hub?: {
    storage?: {
      generateUploadUrl: FunctionReference<'mutation'>
      getUrl: FunctionReference<'query'>
      remove: FunctionReference<'mutation'>
    }
  }
}

type Nullable<T> = T | null | undefined

interface MutationReturn<Args, Result> {
  isLoading: Ref<boolean>
  error: Ref<Nullable<Error>>
  mutate: (args: Args) => Promise<Result | undefined>
}

export interface ConvexStorageReturn {
  generateUploadUrl: MutationReturn<Record<string, never>, string> | { mutate: () => Promise<never> }
  getUrl: (storageId: string) => Ref<string | null>
  remove: MutationReturn<{ storageId: string }, void> | { mutate: () => Promise<never> }
}

/**
 * Composable for Convex file storage operations.
 * Requires convex/_hub/storage.ts functions (auto-scaffolded by module).
 * @param api - The Convex API from `~/convex/_generated/api`
 */
export function useConvexStorage(api: ConvexStorageApi): ConvexStorageReturn {
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
