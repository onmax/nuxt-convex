import { useConvexMutation, useConvexQuery } from '@onmax/convex-vue'
import { useConvexUpload } from '@onmax/convex-vue/storage'
import { computed, shallowRef } from 'vue'
import { api } from '../lib/convex'
import type { StorageId, UploadId } from '../lib/model'

export function useUploadWorkspace(userId: string) {
  const selectedFile = shallowRef<File | null>(null)
  const deletingId = shallowRef<UploadId | null>(null)
  const { data, error: queryError, isPending } = useConvexQuery(
    api._hub.storage.list,
    computed(() => ({ userId })),
    { server: false },
  )
  const { mutate: saveFile, error: saveError } = useConvexMutation(api._hub.storage.saveFile)
  const { mutate: deleteUpload, error: deleteError } = useConvexMutation(api._hub.storage.remove)
  const upload = useConvexUpload({
    onSuccess: async (storageId, file) => {
      await saveFile({
        name: file.name,
        storageId: storageId as StorageId,
        type: file.type || 'application/octet-stream',
        userId,
      })
      selectedFile.value = null
    },
  })

  const uploads = computed(() => data.value ?? [])
  const error = computed(() => upload.error.value ?? saveError.value ?? deleteError.value ?? queryError.value)

  function selectFile(event: Event) {
    const input = event.target as HTMLInputElement
    selectedFile.value = input.files?.[0] ?? null
  }

  async function uploadSelectedFile() {
    if (!selectedFile.value)
      return

    await upload.upload(selectedFile.value)
  }

  async function removeUploadById(id: UploadId) {
    deletingId.value = id
    try {
      await deleteUpload({ id })
    }
    finally {
      deletingId.value = null
    }
  }

  return {
    deletingId,
    error,
    isPending,
    removeUploadById,
    selectFile,
    selectedFile,
    uploadSelectedFile,
    uploadState: upload,
    uploads,
  }
}
