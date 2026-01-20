<script setup lang="ts">
import { api } from '#convex/api'

const toast = useToast()
const { user } = useUserSession()
const userId = computed(() => user.value?.id || '')

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)

// Upload composable
const { upload, isUploading, progress, error: uploadError } = useConvexUpload({
  generateUploadUrl: { mutate: async () => {
    const convex = useConvex()
    return await convex.mutation(api._hub.storage.generateUploadUrl, {})
  } },
  onSuccess: async (storageId, file) => {
    const convex = useConvex()
    await convex.mutation(api._hub.storage.saveFile, { storageId, name: file.name, type: file.type, userId: userId.value })
    toast.add({ title: 'File uploaded', description: file.name, color: 'success' })
    selectedFile.value = null
  },
  onError: (err) => {
    toast.add({ title: 'Upload failed', description: err.message, color: 'error' })
  },
})

// Query uploads
const { data: uploads } = await useConvexQuery(api._hub.storage.list, computed(() => ({ userId: userId.value })))

// Delete mutation
const { mutate: deleteUpload } = useConvexMutation(api._hub.storage.remove)

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
</script>

<template>
  <div class="space-y-6">
    <!-- Upload Demo -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-up-tray" class="text-primary" />
          <span class="font-semibold">useConvexUpload</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-4">
        Upload files to Convex storage with progress tracking.
      </div>

      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect">

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
          <span class="text-muted">({{ (selectedFile.size / 1024).toFixed(1) }} KB)</span>
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

    <!-- Upload State -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-signal" class="text-info" />
          <span class="font-semibold">Upload State</span>
        </div>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div class="flex flex-col gap-1">
          <span class="text-muted">isUploading</span>
          <UBadge :color="isUploading ? 'warning' : 'neutral'" variant="subtle">
            {{ isUploading }}
          </UBadge>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-muted">progress</span>
          <UBadge color="neutral" variant="subtle">
            {{ progress }}%
          </UBadge>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-muted">error</span>
          <UBadge :color="uploadError ? 'error' : 'neutral'" variant="subtle">
            {{ uploadError?.message || 'null' }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- Uploaded Files -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-photo" class="text-secondary" />
            <span class="font-semibold">Uploaded Files</span>
          </div>
          <UBadge v-if="uploads?.length" size="sm" color="neutral" variant="subtle">
            {{ uploads.length }}
          </UBadge>
        </div>
      </template>

      <div class="text-sm text-muted mb-4">
        <code class="bg-muted px-1 rounded">useConvexStorage().getUrl()</code> returns reactive URLs.
      </div>

      <div v-if="uploads?.length" class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div v-for="file in uploads" :key="file._id" class="group relative rounded-lg overflow-hidden border border-default">
          <img v-if="file.type?.startsWith('image/')" :src="file.url" :alt="file.name" class="w-full h-24 object-cover">
          <div v-else class="w-full h-24 bg-muted flex items-center justify-center">
            <UIcon name="i-heroicons-document" class="size-8 text-muted" />
          </div>
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" @click="deleteUpload({ id: file._id })" />
          </div>
          <p class="text-xs text-muted p-2 truncate">
            {{ file.name }}
          </p>
        </div>
      </div>
      <UEmpty v-else icon="i-heroicons-photo" title="No uploads" description="Upload an image above" class="py-6" />
    </UCard>

    <!-- Reactive URLs -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-link" class="text-warning" />
          <span class="font-semibold">Reactive Storage URLs</span>
        </div>
      </template>

      <div class="text-sm text-muted">
        <code class="bg-muted px-1 rounded">storage.getUrl(storageId)</code> returns a <code class="bg-muted px-1 rounded">Ref&lt;string | null&gt;</code> that updates when the URL changes or expires.
      </div>
    </UCard>
  </div>
</template>
