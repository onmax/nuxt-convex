<script setup lang="ts">
import type { Id } from '../../../convex/_generated/dataModel'
import { api } from '#convex/api'

const toast = useToast()
const { user } = useUserSession()
const userId = computed(() => user.value?.id ?? '')

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const deletingId = ref<Id<'uploads'> | null>(null)

const uploadArgs = computed(() => userId.value ? { userId: userId.value } : 'skip' as const)
const { data: uploads, isPending } = useConvexQuery(api._hub.storage.list, uploadArgs)
const { mutate: generateUploadUrl } = useConvexMutation(api._hub.storage.generateUploadUrl)
const { mutate: saveFile } = useConvexMutation(api._hub.storage.saveFile)
const { mutate: removeUpload } = useConvexMutation(api._hub.storage.remove)

const isUploading = ref(false)
const progress = ref(0)
const uploadError = ref<Error | null>(null)

const uploadCount = computed(() => uploads.value?.length ?? 0)

function handleFileChange(event: Event) {
  selectedFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function uploadSelectedFile() {
  if (!selectedFile.value || !userId.value)
    return

  isUploading.value = true
  progress.value = 0
  uploadError.value = null

  try {
    const file = selectedFile.value
    const uploadUrl = await generateUploadUrl({})
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })

    if (!response.ok)
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)

    const { storageId } = await response.json()
    if (typeof storageId !== 'string' || storageId.length === 0)
      throw new Error('Upload response did not include a storageId')

    progress.value = 100
    await saveFile({
      storageId: storageId as Id<'_storage'>,
      name: file.name,
      type: file.type || 'application/octet-stream',
      userId: userId.value,
    })

    selectedFile.value = null
    if (fileInput.value)
      fileInput.value.value = ''
    toast.add({ color: 'success', title: 'File uploaded', description: file.name })
  }
  catch (error) {
    uploadError.value = error instanceof Error ? error : new Error('Upload failed')
    toast.add({ color: 'error', title: 'Upload failed', description: uploadError.value.message })
  }
  finally {
    isUploading.value = false
  }
}

async function removeUploadById(id: Id<'uploads'>) {
  deletingId.value = id
  try {
    await removeUpload({ id })
  }
  catch (uploadError) {
    toast.add({ color: 'error', title: 'Deletion failed', description: uploadError instanceof Error ? uploadError.message : 'Please try again.' })
  }
  finally {
    deletingId.value = null
  }
}
</script>

<template>
  <UDashboardPanel id="storage">
    <template #header>
      <UDashboardNavbar title="Storage">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UBadge color="neutral" variant="subtle">
            {{ uploadCount }} file{{ uploadCount === 1 ? '' : 's' }}
          </UBadge>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange">

          <div class="flex items-center gap-2">
            <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-folder-open" @click="fileInput?.click()">
              Select file
            </UButton>
            <UButton size="sm" :loading="isUploading" :disabled="!selectedFile" @click="uploadSelectedFile">
              Upload
            </UButton>

            <span v-if="selectedFile" class="text-sm text-muted truncate max-w-48">{{ selectedFile.name }}</span>
            <span v-if="isUploading" class="text-sm text-muted">{{ progress }}%</span>
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UAlert v-if="uploadError" color="error" title="Upload error" :description="uploadError.message" class="mb-4" />

      <div v-if="isUploading" class="mb-4">
        <UProgress :value="progress" />
      </div>

      <div v-if="isPending && !uploadCount" class="flex items-center gap-2 py-10 text-muted">
        <UIcon name="i-lucide-loader" class="size-5 animate-spin" />
        Loading assets...
      </div>

      <div v-else-if="uploadCount" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StorageAssetCard
          v-for="uploadEntry in uploads"
          :key="uploadEntry._id"
          :upload="uploadEntry"
          :is-deleting="deletingId === uploadEntry._id"
          @remove="removeUploadById"
        />
      </div>

      <UEmpty v-else icon="i-lucide-image" title="No files yet" description="Upload an image to get started." class="py-10" />
    </template>
  </UDashboardPanel>
</template>
