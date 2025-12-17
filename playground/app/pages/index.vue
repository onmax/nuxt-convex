<script setup lang="ts">
const config = useRuntimeConfig()
const convexUrl = (config.public.convex as { url?: string })?.url

// Auth
const { user, signIn, signOut } = useAuth()
const userId = computed(() => user.value?.id || '')

// All Convex operations are client-only
const tasks = ref<any[]>([])
const uploads = ref<any[]>([])
const newTaskTitle = ref('')
const isAdding = ref(false)
const fileInput = ref<HTMLInputElement>()
const isUploading = ref(false)
const uploadError = ref<Error | null>(null)

let addTaskMutation: any
let deleteTaskMutation: any
let saveFileMutation: any
let deleteUploadMutation: any
let uploadFn: ((file: File) => Promise<string | null>) | null = null

onMounted(async () => {
  if (!userId.value) return

  const { useConvexQuery, useConvexMutation } = await import('#convex')
  const { api } = await import('../../convex/_generated/api')

  // Tasks - filtered by userId
  const tasksQuery = useConvexQuery(api.tasks.list, { userId: userId.value })
  watch(() => tasksQuery.data.value, (v) => {
    tasks.value = v || []
  }, { immediate: true })
  addTaskMutation = useConvexMutation(api.tasks.add)
  deleteTaskMutation = useConvexMutation(api.tasks.remove)

  // Uploads - filtered by userId
  const uploadsQuery = useConvexQuery(api._hub.storage.list, { userId: userId.value })
  watch(() => uploadsQuery.data.value, (v) => {
    uploads.value = v || []
  }, { immediate: true })
  saveFileMutation = useConvexMutation(api._hub.storage.saveFile)
  deleteUploadMutation = useConvexMutation(api._hub.storage.remove)

  // Upload composable
  const { generateUploadUrl } = useConvexStorage(api)
  const uploader = useConvexUpload({
    generateUploadUrl,
    onSuccess: async (storageId, file) => {
      await saveFileMutation.mutate({ storageId, name: file.name, type: file.type, userId: userId.value })
      useToast().add({ title: 'File uploaded', description: file.name, color: 'success' })
    },
    onError: (err) => {
      useToast().add({ title: 'Upload failed', description: err.message, color: 'error' })
    },
  })
  uploadFn = uploader.upload
  watch(() => uploader.isUploading.value, (v) => {
    isUploading.value = v
  })
  watch(() => uploader.error.value, (v) => {
    uploadError.value = v
  })
})

// Re-init queries when user changes
watch(userId, async (newId) => {
  if (!newId) {
    tasks.value = []
    uploads.value = []
    return
  }
  // Trigger re-mount logic
  const { useConvexQuery } = await import('#convex')
  const { api } = await import('../../convex/_generated/api')
  const tasksQuery = useConvexQuery(api.tasks.list, { userId: newId })
  watch(() => tasksQuery.data.value, (v) => {
    tasks.value = v || []
  }, { immediate: true })
  const uploadsQuery = useConvexQuery(api._hub.storage.list, { userId: newId })
  watch(() => uploadsQuery.data.value, (v) => {
    uploads.value = v || []
  }, { immediate: true })
})

async function addTask() {
  if (!newTaskTitle.value.trim() || !addTaskMutation || !userId.value) return
  isAdding.value = true
  try {
    await addTaskMutation.mutate({ title: newTaskTitle.value, userId: userId.value })
    newTaskTitle.value = ''
  } finally {
    isAdding.value = false
  }
}

async function deleteTask(id: string) {
  await deleteTaskMutation?.mutate({ id })
}

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file && uploadFn) {
    await uploadFn(file)
  }
}

async function deleteUpload(id: string) {
  await deleteUploadMutation?.mutate({ id })
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-8 space-y-8">
    <!-- Header with Auth -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
        nuxt-convex Playground
      </h1>
      <div v-if="user" class="flex items-center gap-3">
        <UAvatar :src="user.image" :alt="user.name" size="sm" />
        <span class="text-sm">{{ user.name }}</span>
        <UButton size="sm" variant="ghost" @click="signOut()">
          Sign out
        </UButton>
      </div>
      <UButton v-else icon="i-simple-icons-github" @click="signIn('github')">
        Sign in with GitHub
      </UButton>
    </div>

    <!-- Not logged in state -->
    <UCard v-if="!user">
      <div class="text-center py-8">
        <UIcon name="i-heroicons-lock-closed" class="size-12 text-gray-400 mx-auto mb-4" />
        <h2 class="text-lg font-semibold mb-2">
          Sign in to continue
        </h2>
        <p class="text-gray-500 mb-4">
          Your tasks and uploads are private to your account
        </p>
        <UButton icon="i-simple-icons-github" @click="signIn('github')">
          Sign in with GitHub
        </UButton>
      </div>
    </UCard>

    <ClientOnly v-else>
      <!-- Status Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-check-circle" class="text-green-500" />
            <span class="font-semibold">Connection Status</span>
          </div>
        </template>
        <div class="text-sm">
          <p class="text-gray-600 dark:text-gray-400">
            Connected to: <code class="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{{ convexUrl }}</code>
          </p>
        </div>
      </UCard>

      <!-- Tasks Demo -->
      <UCard>
        <template #header>
          <span class="font-semibold">Tasks Demo</span>
        </template>

        <div class="space-y-4">
          <form class="flex gap-2" @submit.prevent="addTask">
            <UInput v-model="newTaskTitle" placeholder="New task..." class="flex-1" />
            <UButton type="submit" :loading="isAdding" :disabled="!newTaskTitle.trim()">
              Add
            </UButton>
          </form>

          <ul v-if="tasks?.length" class="space-y-2">
            <li v-for="task in tasks" :key="task._id" class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span>{{ task.title }}</span>
              <UButton icon="i-heroicons-trash" size="xs" color="error" variant="ghost" @click="deleteTask(task._id)" />
            </li>
          </ul>
          <p v-else class="text-gray-500 text-sm">
            No tasks yet
          </p>
        </div>
      </UCard>

      <!-- File Upload Demo -->
      <UCard>
        <template #header>
          <span class="font-semibold">File Upload Demo</span>
        </template>

        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload">
            <UButton :loading="isUploading" icon="i-heroicons-arrow-up-tray" @click="fileInput?.click()">
              {{ isUploading ? 'Uploading...' : 'Upload Image' }}
            </UButton>
          </div>

          <UAlert v-if="uploadError" color="error" :title="uploadError.message" />

          <!-- Uploaded Files Grid -->
          <div v-if="uploads?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div v-for="file in uploads" :key="file._id" class="group relative">
              <img v-if="file.type?.startsWith('image/')" :src="file.url" :alt="file.name" class="w-full h-32 object-cover rounded-lg">
              <div v-else class="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <UIcon name="i-heroicons-document" class="size-8 text-gray-400" />
              </div>
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" @click="deleteUpload(file._id)" />
              </div>
              <p class="text-xs text-gray-500 mt-1 truncate">
                {{ file.name }}
              </p>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm">
            No files uploaded yet
          </p>
        </div>
      </UCard>

      <template #fallback>
        <div class="flex justify-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-gray-400" />
        </div>
      </template>
    </ClientOnly>

    <!-- Footer -->
    <p class="text-center text-xs text-gray-400">
      Data auto-deletes after 24 hours
    </p>
  </div>
</template>
