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
const { mutate: saveFile } = useConvexMutation(api._hub.storage.saveFile)
const { mutate: removeUpload } = useConvexMutation(api._hub.storage.remove)

const { upload, isUploading, progress, error } = useConvexUpload({
  onSuccess: async (storageId, file) => {
    await saveFile({
      storageId: storageId as Id<'_storage'>,
      name: file.name,
      type: file.type || 'application/octet-stream',
      userId: userId.value,
    })

    selectedFile.value = null
    toast.add({
      color: 'success',
      title: 'File uploaded to Convex storage',
      description: file.name,
    })
  },
  onError: (uploadError) => {
    toast.add({
      color: 'error',
      title: 'Storage upload failed',
      description: uploadError.message,
    })
  },
})

const uploadCount = computed(() => uploads.value?.length ?? 0)

function handleFileChange(event: Event): void {
  const nextFile = (event.target as HTMLInputElement).files?.[0] ?? null
  selectedFile.value = nextFile
}

async function uploadSelectedFile(): Promise<void> {
  if (!selectedFile.value)
    return

  await upload(selectedFile.value)
  if (fileInput.value)
    fileInput.value.value = ''
}

async function removeUploadById(id: Id<'uploads'>): Promise<void> {
  deletingId.value = id

  try {
    await removeUpload({ id })
  }
  catch (uploadError) {
    toast.add({
      color: 'error',
      title: 'Storage deletion failed',
      description: uploadError instanceof Error ? uploadError.message : 'Please try again.',
    })
  }
  finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <UCard class="border-default/70 shadow-sm">
      <template #header>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-2">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-primary">
              Convex Storage
            </p>
            <h2 class="text-2xl font-semibold text-highlighted">
              Upload, preview, and delete files.
            </h2>
            <p class="max-w-2xl text-sm text-muted">
              Uses `useConvexUpload` and `useConvexStorage().getUrl(...)` from `#convex/storage`.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-2xl border border-default/60 bg-default/80 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.18em] text-dimmed">
                Upload progress
              </p>
              <p class="mt-2 text-2xl font-semibold text-highlighted">
                {{ progress }}%
              </p>
            </div>
            <div class="rounded-2xl border border-default/60 bg-default/80 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.18em] text-dimmed">
                Stored files
              </p>
              <p class="mt-2 text-2xl font-semibold text-highlighted">
                {{ uploadCount }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <div class="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <div class="space-y-4">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          >

          <div class="flex flex-wrap gap-3">
            <UButton size="lg" color="neutral" variant="outline" icon="i-heroicons-folder-open" @click="fileInput?.click()">
              Select file
            </UButton>
            <UButton size="lg" :loading="isUploading" :disabled="!selectedFile" @click="uploadSelectedFile">
              Upload to Convex storage
            </UButton>
          </div>

          <div v-if="selectedFile" class="rounded-2xl border border-default/60 bg-default/70 p-4">
            <p class="font-medium text-highlighted">
              {{ selectedFile.name }}
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ selectedFile.type || 'application/octet-stream' }} · {{ (selectedFile.size / 1024).toFixed(1) }} KB
            </p>
          </div>

          <div v-if="isUploading" class="space-y-2">
            <UProgress :value="progress" />
            <p class="text-sm text-muted">
              The upload helper is streaming directly from the browser.
            </p>
          </div>

          <UAlert
            v-if="error"
            color="error"
            title="Upload error"
            :description="error.message"
          />
        </div>

        <div class="rounded-3xl border border-dashed border-default/70 bg-default/60 p-5">
          <div class="space-y-2">
            <h3 class="font-semibold text-highlighted">
              How it works
            </h3>
            <p class="text-sm text-muted">
              File metadata is persisted separately and storage URLs resolve reactively in the card grid below.
            </p>
          </div>

          <ul class="space-y-3 text-sm text-muted">
            <li class="flex gap-3">
              <UIcon name="i-heroicons-check-circle" class="mt-0.5 size-5 text-success" />
              <span>`useConvexUpload` handles the browser upload and progress state.</span>
            </li>
            <li class="flex gap-3">
              <UIcon name="i-heroicons-check-circle" class="mt-0.5 size-5 text-success" />
              <span>`api._hub.storage.saveFile` persists ownership and metadata after the upload succeeds.</span>
            </li>
            <li class="flex gap-3">
              <UIcon name="i-heroicons-check-circle" class="mt-0.5 size-5 text-success" />
              <span>`useConvexStorage().getUrl(storageId)` provides the current reactive file URL in each preview card.</span>
            </li>
          </ul>
        </div>
      </div>
    </UCard>

    <UCard class="border-default/70 shadow-sm">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="font-semibold text-highlighted">
              Stored assets
            </h3>
            <p class="text-sm text-muted">
              The list updates from Convex in realtime as uploads and deletions complete.
            </p>
          </div>
          <UBadge color="neutral" variant="subtle">
            {{ uploadCount }} file{{ uploadCount === 1 ? '' : 's' }}
          </UBadge>
        </div>
      </template>

      <div v-if="isPending && !uploadCount" class="flex items-center gap-2 py-10 text-muted">
        <UIcon name="i-heroicons-arrow-path" class="size-5 animate-spin" />
        Loading stored assets...
      </div>

      <div v-else-if="uploadCount" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <HarnessStorageAssetCard
          v-for="uploadEntry in uploads"
          :key="uploadEntry._id"
          :upload="uploadEntry"
          :is-deleting="deletingId === uploadEntry._id"
          @remove="removeUploadById"
        />
      </div>

      <UEmpty
        v-else
        icon="i-heroicons-photo"
        title="No stored files yet"
        description="Upload an image above to try file storage."
        class="py-10"
      />
    </UCard>
  </div>
</template>
