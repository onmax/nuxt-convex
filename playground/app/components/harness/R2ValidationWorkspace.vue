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
  onError: (error) => {
    toast.add({
      color: 'error',
      title: 'R2 deletion failed',
      description: error.message,
    })
  },
})

const { upload, isUploading, progress, error } = useConvexR2Upload(r2Api.r2, {
  onSuccess: (key, file) => {
    selectedFile.value = null
    reset()
    toast.add({
      color: 'success',
      title: 'Uploaded to Cloudflare R2',
      description: `${file.name} stored as ${key}`,
    })
  },
  onError: (uploadError) => {
    toast.add({
      color: 'error',
      title: 'R2 upload failed',
      description: uploadError.message,
    })
  },
})

const objectCount = computed(() => objects.value.length)

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

async function removeObject(key: string): Promise<void> {
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
  <div class="space-y-6">
    <UCard class="border-default/70 shadow-sm">
      <template #header>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-2">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-primary">
              Cloudflare R2
            </p>
            <h2 class="text-2xl font-semibold text-highlighted">
              Upload and manage R2 objects via `useConvexR2Upload(api.r2)`.
            </h2>
            <p class="max-w-2xl text-sm text-muted">
              Upload to R2, sync metadata through Convex, list objects, and delete them.
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
                Synced objects
              </p>
              <p class="mt-2 text-2xl font-semibold text-highlighted">
                {{ objectCount }}
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
            class="hidden"
            @change="handleFileChange"
          >

          <div class="flex flex-wrap gap-3">
            <UButton size="lg" color="neutral" variant="outline" icon="i-heroicons-folder-open" @click="fileInput?.click()">
              Select file
            </UButton>
            <UButton size="lg" :loading="isUploading" :disabled="!selectedFile" @click="uploadSelectedFile">
              Upload to R2
            </UButton>
          </div>

          <div v-if="selectedFile" class="rounded-2xl border border-default/60 bg-default/70 p-4">
            <p class="font-medium text-highlighted">
              {{ selectedFile.name }}
            </p>
            <p class="mt-1 text-sm text-muted">
              {{ selectedFile.type || 'application/octet-stream' }} · {{ formatSize(selectedFile.size) }}
            </p>
          </div>

          <div v-if="isUploading" class="space-y-2">
            <UProgress :value="progress" />
            <p class="text-sm text-muted">
              The helper requests the signed URL, uploads directly to R2, and then syncs metadata through Convex.
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
              Required environment
            </h3>
            <p class="text-sm text-muted">
              Set these variables in your Convex environment to enable R2 uploads.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge color="neutral" variant="subtle">
              R2_BUCKET
            </UBadge>
            <UBadge color="neutral" variant="subtle">
              R2_ENDPOINT
            </UBadge>
            <UBadge color="neutral" variant="subtle">
              R2_ACCESS_KEY_ID
            </UBadge>
            <UBadge color="neutral" variant="subtle">
              R2_SECRET_ACCESS_KEY
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>

    <UCard class="border-default/70 shadow-sm">
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="font-semibold text-highlighted">
              R2 objects
            </h3>
            <p class="text-sm text-muted">
              Convex-backed metadata and object URLs stay in sync as uploads and deletions complete.
            </p>
          </div>
          <UBadge color="neutral" variant="subtle">
            {{ objectCount }} object{{ objectCount === 1 ? '' : 's' }}
          </UBadge>
        </div>
      </template>

      <div v-if="isPending && !objectCount" class="flex items-center gap-2 py-10 text-muted">
        <UIcon name="i-heroicons-arrow-path" class="size-5 animate-spin" />
        Loading R2 metadata...
      </div>

      <div v-else-if="objectCount" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="item in objects"
            :key="item.key"
            class="overflow-hidden rounded-3xl border border-default/60 bg-default/70"
          >
            <img
              v-if="item.contentType?.startsWith('image/')"
              :src="item.url"
              :alt="item.key"
              class="h-48 w-full object-cover"
            >
            <div v-else class="flex h-48 items-center justify-center bg-muted">
              <UIcon name="i-heroicons-document" class="size-10 text-dimmed" />
            </div>

            <div class="space-y-3 p-4">
              <div class="space-y-1">
                <p class="truncate font-medium text-highlighted">
                  {{ item.key }}
                </p>
                <p class="text-xs text-dimmed">
                  {{ item.contentType || 'unknown type' }} · {{ formatSize(item.size) }}
                </p>
              </div>

              <div class="flex flex-wrap gap-3">
                <UButton size="sm" color="neutral" variant="outline" :to="item.url" target="_blank">
                  Open object
                </UButton>
                <UButton
                  size="sm"
                  color="error"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  :loading="deletingKey === item.key"
                  @click="removeObject(item.key)"
                >
                  Remove
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 border-t border-default/70 pt-4">
          <UButton v-if="!isDone" size="sm" :loading="isLoadingMore" @click="loadMore">
            Load more objects
          </UButton>
          <UBadge v-else color="success" variant="subtle">
            All objects loaded
          </UBadge>
          <span class="text-sm text-muted">
            {{ objectCount }} object{{ objectCount === 1 ? '' : 's' }} across {{ pages.length }} page{{ pages.length === 1 ? '' : 's' }}.
          </span>
        </div>
      </div>

      <UEmpty
        v-else
        icon="i-simple-icons-cloudflare"
        title="No R2 objects yet"
        description="Upload a file above to try R2 storage."
        class="py-10"
      />
    </UCard>
  </div>
</template>
