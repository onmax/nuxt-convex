import type { Ref } from '#imports'
import type { ConvexClient } from 'convex/browser'
import type { FunctionReference } from 'convex/server'
import { inject, readonly, ref } from '#imports'
import { CONVEX_INJECTION_KEY, useConvexQuery } from '@convex-vue/core'

export interface ConvexStorageApi {
  _hub?: {
    storage?: {
      generateUploadUrl: FunctionReference<'mutation'>
      getUrl: FunctionReference<'query'>
      remove: FunctionReference<'mutation'>
    }
  }
}

export interface ConvexStorageReturn {
  generateUploadUrl: { mutate: () => Promise<string> }
  getUrl: (storageId: string) => Ref<string | null>
  remove: { mutate: (args: { storageId: string }) => Promise<void> }
}

/**
 * Composable for Convex file storage operations.
 * MUST be called during component setup (not in onMounted/callbacks).
 * @param api - The Convex API from `~/convex/_generated/api`
 */
export function useConvexStorage(api: ConvexStorageApi): ConvexStorageReturn {
  const storage = api?._hub?.storage

  if (!storage) {
    console.warn('[nuxt-convex] Storage API not found. Ensure convex/_hub/storage.ts exists and `npx convex dev` is running.')
  }

  // Get Convex client during setup - this captures the injection context
  const client = inject(CONVEX_INJECTION_KEY) as ConvexClient | undefined
  if (!client) {
    console.warn('[nuxt-convex] Convex client not found. Is the plugin installed?')
  }

  return {
    generateUploadUrl: {
      async mutate() {
        if (!client || !storage?.generateUploadUrl)
          throw new Error('[nuxt-convex] Storage API not configured')
        return await client.mutation(storage.generateUploadUrl, {})
      },
    },

    getUrl: (storageId: string) => {
      if (!storage?.getUrl)
        return readonly(ref<string | null>(null))
      const { data } = useConvexQuery(storage.getUrl, { storageId })
      return readonly(data) as Ref<string | null>
    },

    remove: {
      async mutate(args: { storageId: string }) {
        if (!client || !storage?.remove)
          throw new Error('[nuxt-convex] Storage API not configured')
        return await client.mutation(storage.remove, args)
      },
    },
  }
}
