<script setup lang="ts">
const config = useRuntimeConfig()
const convexUrl = (config.public.convex as { url?: string })?.url

// Auth
const { user, signIn, signOut } = useUserSession()
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
  if (!userId.value)
    return

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
  if (!newTaskTitle.value.trim() || !addTaskMutation || !userId.value)
    return
  isAdding.value = true
  try {
    await addTaskMutation.mutate({ title: newTaskTitle.value, userId: userId.value })
    newTaskTitle.value = ''
  }
  finally {
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

const features = [
  { icon: 'i-heroicons-bolt', title: 'Realtime', description: 'Live data sync across all clients' },
  { icon: 'i-heroicons-cloud-arrow-up', title: 'File Storage', description: 'Upload and manage files easily' },
  { icon: 'i-heroicons-shield-check', title: 'Auth Ready', description: 'Built-in authentication support' },
]
</script>

<template>
  <div class="min-h-screen">
    <!-- Logged Out: Hero Landing -->
    <div v-if="!user" class="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <!-- Logos -->
      <div class="flex items-center gap-3 mb-8">
        <UIcon name="i-simple-icons-nuxtdotjs" class="size-12 text-[#00DC82]" />
        <span class="text-2xl text-neutral-500">+</span>
        <UIcon name="i-simple-icons-convex" class="size-12 text-convex-purple" />
      </div>

      <!-- Title -->
      <h1 class="text-5xl font-bold text-gradient mb-4 text-center">
        nuxt-convex
      </h1>
      <p class="text-xl text-neutral-400 mb-10 text-center max-w-md">
        Realtime data & file storage for Nuxt
      </p>

      <!-- Login Button -->
      <UButton size="xl" icon="i-simple-icons-github" @click="signIn.social({ provider: 'github' })">
        Continue with GitHub
      </UButton>

      <!-- Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl">
        <div v-for="feature in features" :key="feature.title" class="text-center p-6 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <UIcon :name="feature.icon" class="size-8 text-convex-purple mb-3 mx-auto" />
          <h3 class="font-semibold text-neutral-200 mb-1">
            {{ feature.title }}
          </h3>
          <p class="text-sm text-neutral-500">
            {{ feature.description }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-xs text-neutral-600 mt-16">
        Demo data auto-deletes after 24h
      </p>
    </div>

    <!-- Logged In: Dashboard -->
    <div v-else class="max-w-5xl mx-auto px-6 py-8">
      <!-- Header -->
      <header class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <UIcon name="i-simple-icons-nuxtdotjs" class="size-6 text-[#00DC82]" />
          <UIcon name="i-simple-icons-convex" class="size-6 text-convex-purple" />
          <span class="text-lg font-semibold text-gradient">nuxt-convex</span>
        </div>
        <div class="flex items-center gap-3">
          <UBadge color="success" variant="subtle" class="gap-1.5">
            <span class="size-2 rounded-full bg-green-500 animate-pulse" />
            Connected
          </UBadge>
          <UAvatar :src="user.image" :alt="user.name" size="sm" />
          <span class="text-sm text-neutral-400 hidden sm:block">{{ user.name }}</span>
          <UButton size="sm" variant="ghost" color="neutral" @click="signOut()">
            Sign out
          </UButton>
        </div>
      </header>

      <ClientOnly>
        <!-- Two Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Tasks -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-clipboard-document-list" class="text-convex-purple" />
                <span class="font-semibold">Tasks</span>
                <UBadge v-if="tasks.length" size="sm" color="neutral" variant="subtle">
                  {{ tasks.length }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-4">
              <form class="flex gap-2" @submit.prevent="addTask">
                <UInput v-model="newTaskTitle" placeholder="Add a task..." class="flex-1" />
                <UButton type="submit" :loading="isAdding" :disabled="!newTaskTitle.trim()">
                  Add
                </UButton>
              </form>

              <ul v-if="tasks?.length" class="space-y-2">
                <li v-for="task in tasks" :key="task._id" class="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
                  <span class="text-neutral-200">{{ task.title }}</span>
                  <UButton icon="i-heroicons-trash" size="xs" color="error" variant="ghost" @click="deleteTask(task._id)" />
                </li>
              </ul>
              <div v-else class="flex flex-col items-center py-8 text-neutral-500">
                <UIcon name="i-heroicons-clipboard" class="size-10 mb-2 opacity-50" />
                <span class="text-sm">No tasks yet</span>
              </div>
            </div>
          </UCard>

          <!-- File Uploads -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-photo" class="text-convex-pink" />
                <span class="font-semibold">Uploads</span>
                <UBadge v-if="uploads.length" size="sm" color="neutral" variant="subtle">
                  {{ uploads.length }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-4">
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload">
              <UButton :loading="isUploading" icon="i-heroicons-arrow-up-tray" variant="outline" class="w-full" @click="fileInput?.click()">
                {{ isUploading ? 'Uploading...' : 'Upload Image' }}
              </UButton>

              <UAlert v-if="uploadError" color="error" :title="uploadError.message" />

              <div v-if="uploads?.length" class="grid grid-cols-2 gap-3">
                <div v-for="file in uploads" :key="file._id" class="group relative">
                  <img v-if="file.type?.startsWith('image/')" :src="file.url" :alt="file.name" class="w-full h-24 object-cover rounded-lg border border-neutral-800">
                  <div v-else class="w-full h-24 bg-neutral-900 rounded-lg flex items-center justify-center border border-neutral-800">
                    <UIcon name="i-heroicons-document" class="size-6 text-neutral-600" />
                  </div>
                  <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" @click="deleteUpload(file._id)" />
                  </div>
                  <p class="text-xs text-neutral-500 mt-1 truncate">
                    {{ file.name }}
                  </p>
                </div>
              </div>
              <div v-else class="flex flex-col items-center py-8 text-neutral-500">
                <UIcon name="i-heroicons-photo" class="size-10 mb-2 opacity-50" />
                <span class="text-sm">No uploads yet</span>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Connection Info -->
        <p class="text-center text-xs text-neutral-600 mt-8">
          Connected to <code class="text-neutral-500">{{ convexUrl }}</code>
        </p>

        <template #fallback>
          <div class="flex justify-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-neutral-600" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
