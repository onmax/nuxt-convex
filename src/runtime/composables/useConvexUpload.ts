import { ref, readonly } from '#imports'

export interface UseConvexUploadOptions {
  /** Mutation to generate upload URL (from useConvexStorage or custom) */
  generateUploadUrl: { mutate: (args?: any) => Promise<string> }
  /** Called on successful upload with storageId and file */
  onSuccess?: (storageId: string, file: File) => void
  /** Called on upload error */
  onError?: (error: Error) => void
}

/**
 * Composable for uploading files to Convex storage.
 *
 * @example
 * ```ts
 * const { generateUploadUrl } = useConvexStorage()
 * const { upload, isUploading, error } = useConvexUpload({
 *   generateUploadUrl,
 *   onSuccess: (id) => console.log('Uploaded:', id)
 * })
 *
 * const handleFile = (file: File) => upload(file)
 * ```
 */
export function useConvexUpload(options: UseConvexUploadOptions) {
  const _isUploading = ref(false)
  const _progress = ref(0)
  const _error = ref<Error | null>(null)

  async function upload(file: File): Promise<string | null> {
    if (import.meta.server) {
      console.warn('[nuxt-convex] useConvexUpload can only be used on client-side')
      return null
    }

    _isUploading.value = true
    _progress.value = 0
    _error.value = null

    try {
      const uploadUrl = await options.generateUploadUrl.mutate({})
      if (!uploadUrl) throw new Error('[nuxt-convex] Failed to generate upload URL')

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!response.ok) {
        throw new Error(`[nuxt-convex] Upload failed: ${response.statusText}`)
      }

      const { storageId } = await response.json()
      _progress.value = 100
      options.onSuccess?.(storageId, file)
      return storageId
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
