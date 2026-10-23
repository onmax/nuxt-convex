import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { QueryStatus } from 'vue-convex'
import type { UseConvexUploadReturn } from 'vue-convex/storage'
import type { FileDoc, StorageId } from '../lib/model'
import { computed, shallowRef } from 'vue'
import { useConvexMutation, useConvexQuery } from 'vue-convex'
import { useConvexStorage, useConvexUpload } from 'vue-convex/storage'
import { api } from '../lib/convex'

interface UseUploadWorkspaceReturn {
  busyId: ShallowRef<StorageId | null>
  error: ComputedRef<Error | null>
  status: Readonly<Ref<QueryStatus>>
  files: ComputedRef<FileDoc[]>
  selectedFile: ShallowRef<File | null>
  uploadState: UseConvexUploadReturn
  selectFile: (event: Event) => void
  uploadSelectedFile: () => Promise<void>
  removeFile: (storageId: StorageId) => Promise<void>
}

export function useUploadWorkspace(): UseUploadWorkspaceReturn {
  const selectedFile = shallowRef<File | null>(null)
  const busyId = shallowRef<StorageId | null>(null)
  const removeError = shallowRef<Error | null>(null)

  const { data, error: queryError, status } = useConvexQuery(api.files.list)
  const { mutate: saveFile, error: saveError } = useConvexMutation(api.files.save)
  const storage = useConvexStorage()

  // Uploads the file to Convex storage, then records it with our own mutation
  const uploadState = useConvexUpload({
    onSuccess: async (storageId, file) => {
      // SAFETY: Convex storage uploads respond with the id of the new `_storage` document.
      await saveFile({
        storageId: storageId as StorageId,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
      })
      selectedFile.value = null
    },
  })

  const files = computed(() => data.value ?? [])
  const error = computed(() => uploadState.error.value ?? saveError.value ?? removeError.value ?? queryError.value)

  function selectFile(event: Event): void {
    const input = event.target
    selectedFile.value = input instanceof HTMLInputElement ? input.files?.[0] ?? null : null
  }

  async function uploadSelectedFile(): Promise<void> {
    if (selectedFile.value)
      await uploadState.upload(selectedFile.value)
  }

  async function removeFile(storageId: StorageId): Promise<void> {
    busyId.value = storageId
    removeError.value = null
    try {
      // The storage plugin's `remove` is files.remove, which also deletes the metadata row
      await storage.remove(storageId)
    }
    catch (cause) {
      removeError.value = cause instanceof Error ? cause : new Error(String(cause))
    }
    finally {
      busyId.value = null
    }
  }

  return { busyId, error, status, files, selectedFile, uploadState, selectFile, uploadSelectedFile, removeFile }
}
