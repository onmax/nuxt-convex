<script setup lang="ts">
import { api } from '#convex/api'

const toast = useToast()

type R2Api = {
  generateUploadUrl: any
  syncMetadata: any
  listMetadata: any
  deleteObject: any
}

const r2Api = api as typeof api & { r2: R2Api }

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)

const {
  data,
  pages,
  isDone,
  isLoadingMore,
  loadMore,
  reset,
  isLoading,
} = useConvexPaginatedQuery(
  r2Api.r2.listMetadata,
  computed(() => ({})),
  { numItems: 9 },
)

const deletingKey = ref<string | null>(null)
const { mutate: deleteObject } = useConvexMutation(r2Api.r2.deleteObject, {
  onError: (err) => {
    toast.add({ title: 'Delete failed', description: err.message, color: 'error' })
  },
})

const { upload, isUploading, progress, error: uploadError } = useConvexR2Upload(r2Api.r2, {
  onSuccess: (key) => {
    toast.add({ title: 'Uploaded to R2', description: key, color: 'success' })
    selectedFile.value = null
    reset()
  },
  onError: (err) => {
    toast.add({ title: 'Upload failed', description: err.message, color: 'error' })
  },
})

function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

async function handleUpload() {
  if (selectedFile.value) {
    await upload(selectedFile.value)
  }
}

async function handleDelete(key: string) {
  if (deletingKey.value) return
  deletingKey.value = key
  try {
    await deleteObject({ key })
    reset()
  }
  finally {
    deletingKey.value = null
  }
}

function formatSize(bytes?: number) {
  if (!bytes && bytes !== 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-simple-icons-cloudflare" class="text-primary" />
          <span class="font-semibold">useConvexR2Upload</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-4">
        Upload files directly to Cloudflare R2 and sync metadata to Convex.
      </div>

      <div class="text-xs text-muted mb-4">
        Requires R2 credentials in your Convex environment: <code class="bg-muted px-1 rounded">R2_BUCKET</code>,
        <code class="bg-muted px-1 rounded">R2_ENDPOINT</code>, <code class="bg-muted px-1 rounded">R2_ACCESS_KEY_ID</code>,
        <code class="bg-muted px-1 rounded">R2_SECRET_ACCESS_KEY</code>.
      </div>

      <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect">

      <div class="space-y-4">
        <div class="flex gap-2">
          <UButton variant="outline" icon="i-heroicons-folder-open" @click="fileInput?.click()">
            Select File
          </UButton>
          <UButton :loading="isUploading" :disabled="!selectedFile" @click="handleUpload">
            Upload
          </UButton>
        </div>

        <div v-if="selectedFile" class="flex items-center gap-2 p-2 rounded bg-muted text-sm">
          <UIcon name="i-heroicons-document" class="text-muted" />
          {{ selectedFile.name }}
          <span class="text-muted">({{ formatSize(selectedFile.size) }})</span>
        </div>

        <div v-if="isUploading" class="space-y-2">
          <UProgress :value="progress" />
          <p class="text-xs text-muted">
            {{ progress }}% uploaded
          </p>
        </div>

        <UAlert v-if="uploadError" color="error" :title="uploadError.message" />
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-cloud" class="text-secondary" />
            <span class="font-semibold">R2 Objects</span>
          </div>
          <UBadge v-if="data?.length" size="sm" color="neutral" variant="subtle">
            {{ data.length }}
          </UBadge>
        </div>
      </template>

      <div v-if="isLoading && !data?.length" class="flex items-center gap-2 text-muted py-4">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        Loading metadata...
      </div>

      <div v-else-if="data?.length" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="item in data" :key="item.key" class="rounded-lg border border-default overflow-hidden">
            <img v-if="item.contentType?.startsWith('image/')" :src="item.url" :alt="item.key" class="w-full h-32 object-cover">
            <div v-else class="w-full h-32 bg-muted flex items-center justify-center">
              <UIcon name="i-heroicons-document" class="size-8 text-muted" />
            </div>

            <div class="p-3 space-y-2">
              <p class="text-xs text-muted truncate" :title="item.key">
                {{ item.key }}
              </p>
              <div class="flex flex-wrap gap-2 text-xs">
                <UBadge color="neutral" variant="subtle">
                  {{ item.contentType || 'unknown' }}
                </UBadge>
                <UBadge color="neutral" variant="subtle">
                  {{ formatSize(item.size) }}
                </UBadge>
              </div>

              <div class="flex items-center gap-2">
                <UButton size="xs" variant="outline" :to="item.url" target="_blank">
                  Open
                </UButton>
                <UButton
                  size="xs"
                  icon="i-heroicons-trash"
                  color="error"
                  variant="ghost"
                  :loading="deletingKey === item.key"
                  @click="handleDelete(item.key)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-default">
          <div class="text-xs text-muted">
            Showing {{ data.length }} items across {{ pages.length }} page(s)
          </div>
          <UButton v-if="!isDone" size="sm" :loading="isLoadingMore" @click="loadMore">
            Load More
          </UButton>
          <UBadge v-else color="success" variant="subtle">
            All loaded
          </UBadge>
        </div>
      </div>

      <UEmpty v-else icon="i-heroicons-cloud" title="No R2 objects" description="Upload a file above" class="py-6" />
    </UCard>
  </div>
</template>
