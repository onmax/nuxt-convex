<script setup lang="ts">
import type { ConvexClient } from 'convex/browser'

const config = useRuntimeConfig()
const convexUrl = (config.public.convex as { url?: string })?.url

// Auth
const { user, signIn, signOut } = useUserSession()
const userId = computed(() => user.value?.id || '')

// Convex state
const tasks = ref<any[]>([])
const uploads = ref<any[]>([])
const newTaskTitle = ref('')
const isAdding = ref(false)
const fileInput = ref<HTMLInputElement>()
const isUploading = ref(false)
const uploadError = ref<Error | null>(null)

let convexClient: ConvexClient | null = null
let api: any = null
let uploadFn: ((file: File) => Promise<string | null>) | null = null
let tasksUnsubscribe: (() => void) | null = null
let uploadsUnsubscribe: (() => void) | null = null

if (import.meta.client) {
  const { useConvex } = await import('#convex')
  convexClient = useConvex()
  api = (await import('../../convex/_generated/api')).api
}

function subscribeToData(uid: string) {
  if (!convexClient || !api || !uid)
    return
  tasksUnsubscribe?.()
  uploadsUnsubscribe?.()
  tasksUnsubscribe = convexClient.onUpdate(api.tasks.list, { userId: uid }, (result) => {
    tasks.value = result || []
  })
  uploadsUnsubscribe = convexClient.onUpdate(api._hub.storage.list, { userId: uid }, (result) => {
    uploads.value = result || []
  })
}

onMounted(() => {
  if (!userId.value || !convexClient || !api)
    return
  subscribeToData(userId.value)
  const uploader = useConvexUpload({
    generateUploadUrl: { mutate: () => convexClient!.mutation(api._hub.storage.generateUploadUrl, {}) },
    onSuccess: async (storageId, file) => {
      await convexClient!.mutation(api._hub.storage.saveFile, { storageId, name: file.name, type: file.type, userId: userId.value })
      useToast().add({ title: 'File uploaded', description: file.name, color: 'success' })
    },
    onError: (err) => {
      useToast().add({ title: 'Upload failed', description: err.message, color: 'error' })
    },
  })
  uploadFn = uploader.upload
  watch(() => uploader.isUploading.value, v => isUploading.value = v)
  watch(() => uploader.error.value, v => uploadError.value = v)
})

watch(userId, (newId) => {
  if (!newId) {
    tasks.value = []
    uploads.value = []
    tasksUnsubscribe?.()
    uploadsUnsubscribe?.()
    return
  }
  subscribeToData(newId)
})

onUnmounted(() => {
  tasksUnsubscribe?.()
  uploadsUnsubscribe?.()
})

async function addTask() {
  if (!newTaskTitle.value.trim() || !convexClient || !api || !userId.value)
    return
  isAdding.value = true
  try {
    await convexClient.mutation(api.tasks.add, { title: newTaskTitle.value, userId: userId.value })
    newTaskTitle.value = ''
  }
  finally {
    isAdding.value = false
  }
}

async function deleteTask(id: string) {
  if (!convexClient || !api)
    return
  await convexClient.mutation(api.tasks.remove, { id })
}

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file && uploadFn)
    await uploadFn(file)
}

async function deleteUpload(id: string) {
  if (!convexClient || !api)
    return
  await convexClient.mutation(api._hub.storage.remove, { id })
}

const features = [
  { icon: 'i-heroicons-bolt', title: 'Realtime', description: 'Live subscriptions sync data instantly across all clients' },
  { icon: 'i-heroicons-cloud-arrow-up', title: 'File Storage', description: 'Upload files directly to Convex with NuxtHub' },
  { icon: 'i-heroicons-shield-check', title: 'Auth Ready', description: 'Seamless better-auth integration' },
]
</script>

<template>
  <div class="min-h-screen bg-default">
    <!-- Logged Out: Hero -->
    <div v-if="!user" class="min-h-screen flex flex-col">
      <!-- Header -->
      <header class="flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-simple-icons-nuxtdotjs" class="size-6 text-nuxt" />
          <UIcon name="i-custom-convex" class="size-6 text-primary" />
        </div>
        <UColorModeButton />
      </header>

      <!-- Hero -->
      <div class="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div class="flex items-center gap-4 mb-8">
          <UIcon name="i-simple-icons-nuxtdotjs" class="size-12 text-nuxt" />
          <span class="text-2xl text-muted">+</span>
          <UIcon name="i-custom-convex" class="size-12 text-primary" />
        </div>

        <h1 class="text-5xl sm:text-6xl font-bold text-highlighted mb-4 text-center">
          nuxt-convex
        </h1>
        <p class="text-xl text-muted mb-10 text-center max-w-md">
          Realtime data & file storage for Nuxt
        </p>

        <UButton size="xl" icon="i-simple-icons-github" @click="signIn.social({ provider: 'github' })">
          Continue with GitHub
        </UButton>

        <!-- Features -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
          <UCard v-for="feature in features" :key="feature.title" class="text-center">
            <div class="flex flex-col items-center gap-3">
              <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UIcon :name="feature.icon" class="size-5 text-primary" />
              </div>
              <h3 class="font-semibold text-highlighted">
                {{ feature.title }}
              </h3>
              <p class="text-sm text-muted">
                {{ feature.description }}
              </p>
            </div>
          </UCard>
        </div>

        <p class="text-xs text-dimmed mt-16">
          Demo data auto-deletes after 24h
        </p>
      </div>
    </div>

    <!-- Logged In: Dashboard -->
    <div v-else class="max-w-5xl mx-auto px-6 py-8">
      <!-- Header -->
      <header class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <UIcon name="i-simple-icons-nuxtdotjs" class="size-6 text-nuxt" />
          <UIcon name="i-custom-convex" class="size-6 text-primary" />
          <span class="text-lg font-semibold text-highlighted">nuxt-convex</span>
        </div>
        <div class="flex items-center gap-3">
          <UBadge color="success" variant="subtle">
            <span class="size-1.5 rounded-full bg-success animate-pulse mr-1.5" />
            Connected
          </UBadge>
          <UColorModeButton />
          <USeparator orientation="vertical" class="h-6" />
          <UAvatar :src="user.image" :alt="user.name" size="sm" />
          <span class="text-sm text-muted hidden sm:block">{{ user.name }}</span>
          <UButton size="sm" variant="ghost" color="neutral" icon="i-heroicons-arrow-right-on-rectangle" @click="signOut()">
            <span class="sr-only sm:not-sr-only">Sign out</span>
          </UButton>
        </div>
      </header>

      <ClientOnly>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Tasks -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-clipboard-document-list" class="text-primary" />
                  <span class="font-semibold">Tasks</span>
                </div>
                <UBadge v-if="tasks.length" size="sm" color="neutral" variant="subtle">
                  {{ tasks.length }}
                </UBadge>
              </div>
            </template>

            <form class="flex gap-2 mb-4" @submit.prevent="addTask">
              <UInput v-model="newTaskTitle" placeholder="Add a task..." class="flex-1" />
              <UButton type="submit" :loading="isAdding" :disabled="!newTaskTitle.trim()">
                Add
              </UButton>
            </form>

            <div class="space-y-2">
              <div
                v-for="task in tasks"
                :key="task._id"
                class="group flex items-center justify-between p-3 rounded-lg bg-muted"
              >
                <span class="text-default">{{ task.title }}</span>
                <UButton
                  icon="i-heroicons-trash"
                  size="xs"
                  color="error"
                  variant="ghost"
                  class="opacity-0 group-hover:opacity-100"
                  @click="deleteTask(task._id)"
                />
              </div>
              <UEmpty v-if="!tasks.length" icon="i-heroicons-clipboard" title="No tasks yet" class="py-6" />
            </div>
          </UCard>

          <!-- Uploads -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-photo" class="text-secondary" />
                  <span class="font-semibold">Uploads</span>
                </div>
                <UBadge v-if="uploads.length" size="sm" color="neutral" variant="subtle">
                  {{ uploads.length }}
                </UBadge>
              </div>
            </template>

            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload">
            <UButton
              :loading="isUploading"
              icon="i-heroicons-arrow-up-tray"
              variant="outline"
              class="w-full mb-4"
              @click="fileInput?.click()"
            >
              {{ isUploading ? 'Uploading...' : 'Upload Image' }}
            </UButton>

            <UAlert v-if="uploadError" color="error" :title="uploadError.message" class="mb-4" />

            <div v-if="uploads.length" class="grid grid-cols-2 gap-3">
              <div v-for="file in uploads" :key="file._id" class="group relative rounded-lg overflow-hidden">
                <img
                  v-if="file.type?.startsWith('image/')"
                  :src="file.url"
                  :alt="file.name"
                  class="w-full h-24 object-cover"
                >
                <div v-else class="w-full h-24 bg-muted flex items-center justify-center">
                  <UIcon name="i-heroicons-document" class="size-6 text-muted" />
                </div>
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="sm" @click="deleteUpload(file._id)" />
                </div>
                <p class="text-xs text-muted mt-1 truncate">
                  {{ file.name }}
                </p>
              </div>
            </div>
            <UEmpty v-else icon="i-heroicons-photo" title="No uploads yet" class="py-6" />
          </UCard>
        </div>

        <p class="text-center text-xs text-dimmed mt-8">
          Connected to <code class="text-muted">{{ convexUrl }}</code>
        </p>

        <template #fallback>
          <div class="flex justify-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-muted" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
