<script setup lang="ts">
import { api } from '#convex/api'

interface R2Api {
  generateUploadUrl: unknown
  syncMetadata: unknown
  listMetadata: unknown
  deleteObject: unknown
}

const toast = useToast()
const r2Api = api as typeof api & { r2: R2Api }

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const deletingKey = ref<string | null>(null)

const {
  data: objects,
  pages,
  isDone,
  isLoadingMore,
  loadMore,
  reset,
  isPending,
} = useConvexPaginatedQuery(r2Api.r2.listMetadata, computed(() => ({})), { numItems: 8 })

const { mutate: deleteObject } = useConvexMutation(r2Api.r2.deleteObject, {
  onError: (error: Error) => {
    toast.add({ color: 'error', title: 'R2 deletion failed', description: error.message })
  },
})

const { upload, isUploading, progress, error } = useConvexR2Upload(r2Api.r2, {
  onSuccess: (key, file) => {
    selectedFile.value = null
    reset()
    toast.add({ color: 'success', title: 'Uploaded to R2', description: `${file.name} → ${key}` })
  },
  onError: (uploadError) => {
    toast.add({ color: 'error', title: 'R2 upload failed', description: uploadError.message })
  },
})

const objectCount = computed(() => objects.value.length)

function handleFileChange(event: Event) {
  selectedFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function uploadSelectedFile() {
  if (!selectedFile.value)
    return
  await upload(selectedFile.value)
  if (fileInput.value)
    fileInput.value.value = ''
}

async function removeObject(key: string) {
  deletingKey.value = key
  try {
    await deleteObject({ key })
    reset()
  }
  finally {
    deletingKey.value = null
  }
}

function formatSize(bytes?: number): string {
  if (!bytes && bytes !== 0)
    return '—'
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <UDashboardPanel id="r2">
    <template #header>
      <UDashboardNavbar title="Cloudflare R2">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UBadge color="neutral" variant="subtle">
            {{ objectCount }} object{{ objectCount === 1 ? '' : 's' }}
          </UBadge>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <input ref="fileInput" type="file" class="hidden" @change="handleFileChange">

          <div class="flex items-center gap-2">
            <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-folder-open" @click="fileInput?.click()">
              Select file
            </UButton>
            <UButton size="sm" :loading="isUploading" :disabled="!selectedFile" @click="uploadSelectedFile">
              Upload to R2
            </UButton>

            <span v-if="selectedFile" class="text-sm text-muted truncate max-w-48">{{ selectedFile.name }}</span>
            <span v-if="isUploading" class="text-sm text-muted">{{ progress }}%</span>
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UAlert v-if="error" color="error" title="Upload error" :description="error.message" class="mb-4" />

      <div v-if="isUploading" class="mb-4">
        <UProgress :value="progress" />
      </div>

      <div v-if="isPending && !objectCount" class="flex items-center gap-2 py-10 text-muted">
        <UIcon name="i-lucide-loader" class="size-5 animate-spin" />
        Loading R2 metadata...
      </div>

      <div v-else-if="objectCount" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="item in objects"
            :key="item.key"
            class="overflow-hidden rounded-md border border-default bg-elevated/50"
          >
            <img
              v-if="item.contentType?.startsWith('image/')"
              :src="item.url"
              :alt="item.key"
              class="h-40 w-full object-cover"
            >
            <div v-else class="flex h-40 items-center justify-center bg-muted">
              <UIcon name="i-lucide-file" class="size-10 text-dimmed" />
            </div>

            <div class="space-y-2 p-3">
              <div>
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ item.key }}
                </p>
                <p class="text-xs text-dimmed">
                  {{ item.contentType || 'unknown' }} · {{ formatSize(item.size) }}
                </p>
              </div>

              <div class="flex gap-2">
                <UButton size="xs" color="neutral" variant="outline" :to="item.url" target="_blank">
                  Open
                </UButton>
                <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" :loading="deletingKey === item.key" @click="removeObject(item.key)">
                  Remove
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 border-t border-default pt-4">
          <UButton v-if="!isDone" size="sm" :loading="isLoadingMore" @click="loadMore">
            Load more
          </UButton>
          <UBadge v-else color="success" variant="subtle">
            All loaded
          </UBadge>
          <span class="text-sm text-muted">{{ objectCount }} across {{ pages.length }} page{{ pages.length === 1 ? '' : 's' }}</span>
        </div>
      </div>

      <UEmpty v-else icon="i-simple-icons-cloudflare" title="No R2 objects" description="Upload a file to get started." class="py-10" />
    </template>
  </UDashboardPanel>
</template>
