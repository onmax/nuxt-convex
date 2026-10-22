import type { Ref } from 'vue'
import { shallowReadonly, shallowRef } from 'vue'
import { normalizeError } from './internal/useConvexRuntimeContext'
import { useConvexStorage } from './useConvexStorage'

export interface UseConvexUploadOptions {
  generateUploadUrl?: () => Promise<string>
  onSuccess?: (storageId: string, file: File) => void | Promise<void>
  onError?: (error: Error) => void
  onProgress?: (progress: { loaded: number, total: number }) => void
}

export interface UseConvexUploadReturn {
  /** Uploads `file` and resolves with its storage id, or `null` on failure or abort. */
  upload: (file: File, options?: { signal?: AbortSignal }) => Promise<string | null>
  isUploading: Readonly<Ref<boolean>>
  /** 0 to 100. */
  progress: Readonly<Ref<number>>
  error: Readonly<Ref<Error | null>>
}

function post(url: string, file: File, signal: AbortSignal | undefined, onProgress: (loaded: number, total: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const onAbort = (): void => xhr.abort()
    xhr.open('POST', url)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.upload.onprogress = event => onProgress(event.loaded, event.lengthComputable ? event.total : file.size)
    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort)
      if (xhr.status >= 200 && xhr.status < 300)
        resolve(xhr.responseText)
      else
        reject(new Error(`[convex-vue/storage] Upload failed: ${xhr.status} ${xhr.statusText}`))
    }
    xhr.onerror = () => reject(new Error('[convex-vue/storage] Upload failed: network error'))
    xhr.onabort = () => reject(signal?.reason ?? new DOMException('Upload aborted', 'AbortError'))
    if (signal?.aborted)
      return onAbort()
    signal?.addEventListener('abort', onAbort, { once: true })
    xhr.send(file)
  })
}

export function useConvexUpload(options: UseConvexUploadOptions = {}): UseConvexUploadReturn {
  const storage = useConvexStorage()
  const isUploading = shallowRef(false)
  const progress = shallowRef(0)
  const error = shallowRef<Error | null>(null)

  const fail = (err: unknown): null => {
    error.value = normalizeError(err)
    options.onError?.(error.value)
    return null
  }

  return {
    async upload(file, { signal } = {}) {
      if (typeof window === 'undefined')
        return fail(new Error('[convex-vue/storage] Uploads are only available on the client'))

      isUploading.value = true
      progress.value = 0
      error.value = null

      try {
        const uploadUrl = await (options.generateUploadUrl ?? storage.generateUploadUrl)()
        signal?.throwIfAborted()
        const body = await post(uploadUrl, file, signal, (loaded, total) => {
          progress.value = total > 0 ? Math.min(99, Math.round((loaded / total) * 100)) : 0
          options.onProgress?.({ loaded, total })
        })

        const { storageId } = JSON.parse(body) as { storageId?: unknown }
        if (typeof storageId !== 'string' || storageId.length === 0)
          throw new Error('[convex-vue/storage] Upload response did not include a storageId')

        progress.value = 100
        await options.onSuccess?.(storageId, file)
        return storageId
      }
      catch (err) {
        return fail(err)
      }
      finally {
        isUploading.value = false
      }
    },
    isUploading: shallowReadonly(isUploading),
    progress: shallowReadonly(progress),
    error: shallowReadonly(error),
  }
}
