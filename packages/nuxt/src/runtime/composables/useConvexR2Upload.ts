import type { FunctionReference } from 'convex/server'
import type { DeepReadonly, Ref } from 'vue'
import { useUploadFile } from '@convex-dev/r2/vue'
import { readonly, ref } from 'vue'

export interface ConvexR2Api {
  generateUploadUrl: FunctionReference<'mutation'>
  syncMetadata: FunctionReference<'mutation'>
}

export interface UseConvexR2UploadOptions {
  onSuccess?: (key: string, file: File) => void
  onError?: (error: Error) => void
  onProgress?: (progress: { loaded: number, total: number }) => void
}

export interface UseConvexR2UploadReturn {
  upload: (file: File) => Promise<string | null>
  isUploading: DeepReadonly<Ref<boolean>>
  progress: DeepReadonly<Ref<number>>
  error: DeepReadonly<Ref<Error | null>>
}

export function useConvexR2Upload(api: ConvexR2Api, options: UseConvexR2UploadOptions = {}): UseConvexR2UploadReturn {
  const isUploading = ref(false)
  const progress = ref(0)
  const error = ref<Error | null>(null)
  const uploadFile = useUploadFile(api)

  return {
    error: readonly(error),
    isUploading: readonly(isUploading),
    progress: readonly(progress),
    async upload(file) {
      if (import.meta.server) {
        const serverError = new Error('[nuxt-convex] R2 uploads are only available on the client')
        error.value = serverError
        options.onError?.(serverError)
        return null
      }

      isUploading.value = true
      progress.value = 0
      error.value = null

      try {
        const key = await uploadFile(file, {
          onProgress: (nextProgress) => {
            progress.value = nextProgress.total > 0
              ? Math.round((nextProgress.loaded / nextProgress.total) * 100)
              : 0
            options.onProgress?.(nextProgress)
          },
        })

        progress.value = 100
        options.onSuccess?.(key, file)
        return key
      }
      catch (cause) {
        error.value = cause instanceof Error ? cause : new Error(String(cause))
        options.onError?.(error.value)
        return null
      }
      finally {
        isUploading.value = false
      }
    },
  }
}
