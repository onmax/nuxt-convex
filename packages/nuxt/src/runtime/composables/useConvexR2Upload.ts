import type { FunctionReference } from 'convex/server'
import type { DeepReadonly, Ref } from 'vue'
import { useConvexClient } from 'convex-vue/advanced'
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

interface SignedUploadUrl {
  key: string
  url: string
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress?: (progress: { loaded: number, total: number }) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        onProgress({ loaded: event.loaded, total: event.total })
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }

      reject(new Error(`Failed to upload file: ${xhr.statusText}`))
    }
    xhr.onerror = () => reject(new Error('Failed to upload file'))
    xhr.send(file)
  })
}

export function useConvexR2Upload(api: ConvexR2Api, options: UseConvexR2UploadOptions = {}): UseConvexR2UploadReturn {
  const isUploading = ref(false)
  const progress = ref(0)
  const error = ref<Error | null>(null)

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

      const client = useConvexClient()
      isUploading.value = true
      progress.value = 0
      error.value = null

      try {
        const { key, url } = await client.mutation(api.generateUploadUrl, {}) as SignedUploadUrl

        await uploadWithProgress(url, file, (nextProgress) => {
          progress.value = nextProgress.total > 0
            ? Math.round((nextProgress.loaded / nextProgress.total) * 100)
            : 0
          options.onProgress?.(nextProgress)
        })

        await client.mutation(api.syncMetadata, { key })
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
