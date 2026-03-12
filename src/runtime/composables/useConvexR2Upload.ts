import type { FunctionReference } from 'convex/server'
import type { DeepReadonly, Ref } from 'vue'
import { readonly, ref } from '#imports'
import { useUploadFile } from '@convex-dev/r2/vue'

export interface ConvexR2Api {
  generateUploadUrl: FunctionReference<'mutation'>
  syncMetadata: FunctionReference<'mutation'>
}

export interface UseConvexR2UploadOptions {
  /** Called on successful upload with key and file */
  onSuccess?: (key: string, file: File) => void
  /** Called on upload error */
  onError?: (error: Error) => void
  /** Called during upload progress */
  onProgress?: (progress: { loaded: number, total: number }) => void
}

export interface UseConvexR2UploadReturn {
  upload: (file: File) => Promise<string | null>
  isUploading: DeepReadonly<Ref<boolean>>
  progress: DeepReadonly<Ref<number>>
  error: DeepReadonly<Ref<Error | null>>
}

/**
 * Composable for uploading files to Convex R2 storage.
 *
 * @example
 * ```ts
 * import { api } from '#convex/api'
 * const { upload, isUploading, progress } = useConvexR2Upload(api.r2, {
 *   onSuccess: (key) => console.log('Uploaded:', key),
 * })
 * ```
 */
export function useConvexR2Upload(api: ConvexR2Api, options: UseConvexR2UploadOptions = {}): UseConvexR2UploadReturn {
  const _isUploading = ref(false)
  const _progress = ref(0)
  const _error = ref<Error | null>(null)

  const uploadFile = useUploadFile(api)

  async function upload(file: File): Promise<string | null> {
    if (import.meta.server) {
      console.warn('[nuxt-convex] useConvexR2Upload can only be used on client-side')
      return null
    }

    _isUploading.value = true
    _progress.value = 0
    _error.value = null

    try {
      const key = await uploadFile(file, {
        onProgress: (progress) => {
          const percent = progress.total > 0
            ? Math.round((progress.loaded / progress.total) * 100)
            : 0
          _progress.value = percent
          options.onProgress?.(progress)
        },
      })

      _progress.value = 100
      options.onSuccess?.(key, file)
      return key
    }
    catch (e) {
      const error = e as Error
      _error.value = error
      options.onError?.(error)
      return null
    }
    finally {
      _isUploading.value = false
    }
  }

  return {
    upload,
    isUploading: readonly(_isUploading),
    progress: readonly(_progress),
    error: readonly(_error),
  }
}
