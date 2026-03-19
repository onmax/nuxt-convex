import type { DeepReadonly, Ref } from 'vue'
import { readonly, ref } from 'vue'
import { normalizeError } from './internal/useConvexRuntimeContext'
import { useConvexStorage } from './useConvexStorage'

export interface UseConvexUploadOptions {
  generateUploadUrl?: () => Promise<string>
  onSuccess?: (storageId: string, file: File) => void | Promise<void>
  onError?: (error: Error) => void
}

export interface UseConvexUploadReturn {
  upload: (file: File) => Promise<string | null>
  isUploading: DeepReadonly<Ref<boolean>>
  progress: DeepReadonly<Ref<number>>
  error: DeepReadonly<Ref<Error | null>>
}

export function useConvexUpload(options: UseConvexUploadOptions = {}): UseConvexUploadReturn {
  const storage = useConvexStorage()
  const isUploading = ref(false)
  const progress = ref(0)
  const error = ref<Error | null>(null)

  return {
    async upload(file) {
      if (typeof window === 'undefined') {
        const serverError = new Error('[convex-vue/storage] Uploads are only available on the client')
        error.value = serverError
        options.onError?.(serverError)
        return null
      }

      isUploading.value = true
      progress.value = 0
      error.value = null

      try {
        const uploadUrl = await (options.generateUploadUrl ?? storage.generateUploadUrl)()
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })

        if (!response.ok)
          throw new Error(`[convex-vue/storage] Upload failed: ${response.status} ${response.statusText}`)

        const { storageId } = await response.json()
        if (typeof storageId !== 'string' || storageId.length === 0)
          throw new Error('[convex-vue/storage] Upload response did not include a storageId')

        progress.value = 100
        await options.onSuccess?.(storageId, file)
        return storageId
      }
      catch (err) {
        error.value = normalizeError(err)
        options.onError?.(error.value)
        return null
      }
      finally {
        isUploading.value = false
      }
    },
    isUploading: readonly(isUploading),
    progress: readonly(progress),
    error: readonly(error),
  }
}
