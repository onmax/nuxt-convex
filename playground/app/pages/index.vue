<script setup lang="ts">
import type { ConvexClient } from 'convex/browser'

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

// Get Convex client during setup - this captures the injection context
let convexClient: ConvexClient | null = null
let api: any = null
let uploadFn: ((file: File) => Promise<string | null>) | null = null
let tasksUnsubscribe: (() => void) | null = null
let uploadsUnsubscribe: (() => void) | null = null

// Must be called during setup to capture Vue injection context
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
  { icon: 'i-heroicons-bolt', title: 'Realtime', description: 'Live subscriptions sync data instantly across all connected clients', color: 'purple' },
  { icon: 'i-heroicons-cloud-arrow-up', title: 'File Storage', description: 'Upload files directly to Convex with NuxtHub integration', color: 'pink' },
  { icon: 'i-heroicons-shield-check', title: 'Auth Ready', description: 'Seamless better-auth integration with session management', color: 'green' },
]
</script>

<template>
  <div class="min-h-screen bg-animated-gradient">
    <!-- Logged Out: Hero Landing -->
    <div v-if="!user" class="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      <!-- Background Effects -->
      <div class="absolute inset-0 bg-grid-pattern" />
      <div class="absolute inset-0 bg-radial-glow" />
      <div class="absolute inset-0 noise-overlay pointer-events-none" />

      <!-- Floating orbs -->
      <div class="absolute top-1/4 left-1/4 size-64 rounded-full bg-convex-purple/10 blur-3xl animate-float" />
      <div class="absolute bottom-1/4 right-1/4 size-48 rounded-full bg-convex-pink/10 blur-3xl animate-float-delayed" />

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center">
        <!-- Logos with glow -->
        <div class="flex items-center gap-4 mb-10 animate-fade-in-up">
          <div class="relative">
            <UIcon name="i-simple-icons-nuxtdotjs" class="size-14 text-[#00DC82] drop-shadow-[0_0_20px_rgba(0,220,130,0.5)]" />
          </div>
          <div class="flex flex-col items-center gap-1">
            <span class="size-1.5 rounded-full bg-convex-purple animate-data-stream" />
            <span class="size-1.5 rounded-full bg-convex-pink animate-data-stream-delayed" />
            <span class="size-1.5 rounded-full bg-convex-purple animate-data-stream-delayed-2" />
          </div>
          <div class="relative">
            <UIcon name="i-simple-icons-convex" class="size-14 text-convex-purple drop-shadow-[0_0_20px_rgba(148,138,227,0.5)]" />
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-6xl sm:text-7xl font-black tracking-tight text-gradient mb-5 text-center animate-fade-in-up animate-delay-100">
          nuxt-convex
        </h1>
        <p class="text-xl sm:text-2xl text-muted mb-12 text-center max-w-lg animate-fade-in-up animate-delay-200">
          Realtime data & file storage for Nuxt
        </p>

        <!-- Login Button -->
        <div class="animate-fade-in-up animate-delay-300">
          <UButton
            size="xl"
            icon="i-simple-icons-github"
            class="px-8 py-3 text-lg font-semibold hover-lift glow-purple"
            @click="signIn.social({ provider: 'github' })"
          >
            Continue with GitHub
          </UButton>
        </div>

        <!-- Features -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 max-w-4xl animate-fade-in-up animate-delay-400">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="feature-card text-center p-6 rounded-2xl bg-elevated/50 backdrop-blur-sm"
          >
            <div
              class="size-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
              :class="{
                'bg-convex-purple/10': feature.color === 'purple',
                'bg-convex-pink/10': feature.color === 'pink',
                'bg-convex-green/10': feature.color === 'green',
              }"
            >
              <UIcon
                :name="feature.icon"
                class="size-6"
                :class="{
                  'text-convex-purple': feature.color === 'purple',
                  'text-convex-pink': feature.color === 'pink',
                  'text-convex-green': feature.color === 'green',
                }"
              />
            </div>
            <h3 class="text-lg font-semibold text-highlighted mb-2">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-dimmed leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-xs text-dimmed mt-20 animate-fade-in-up animate-delay-500">
          Demo data auto-deletes after 24h
        </p>
      </div>
    </div>

    <!-- Logged In: Dashboard -->
    <div v-else class="relative min-h-screen">
      <!-- Background -->
      <div class="absolute inset-0 bg-grid-pattern opacity-50" />

      <div class="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <!-- Header -->
        <header class="flex items-center justify-between mb-10 animate-fade-in-up">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <UIcon name="i-simple-icons-nuxtdotjs" class="size-6 text-[#00DC82]" />
              <UIcon name="i-simple-icons-convex" class="size-6 text-convex-purple" />
            </div>
            <span class="text-xl font-bold text-gradient">nuxt-convex</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="status-live text-sm text-convex-green font-medium">
              Realtime
            </div>
            <USeparator orientation="vertical" class="h-6" />
            <div class="flex items-center gap-3">
              <UAvatar :src="user.image" :alt="user.name" size="sm" class="ring-2 ring-convex-purple/30" />
              <span class="text-sm text-default hidden sm:block font-medium">{{ user.name }}</span>
            </div>
            <UButton size="sm" variant="ghost" color="neutral" icon="i-heroicons-arrow-right-on-rectangle" @click="signOut()">
              <span class="hidden sm:inline">Sign out</span>
            </UButton>
          </div>
        </header>

        <ClientOnly>
          <!-- Two Column Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Tasks Card -->
            <UCard class="card-gradient-border animate-fade-in-up animate-delay-100" :ui="{ body: 'p-6' }">
              <template #header>
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-xl bg-convex-purple/10 flex items-center justify-center">
                    <UIcon name="i-heroicons-clipboard-document-list" class="size-5 text-convex-purple" />
                  </div>
                  <div>
                    <h2 class="font-semibold text-highlighted">
                      Tasks
                    </h2>
                    <p class="text-xs text-dimmed">
                      Realtime sync enabled
                    </p>
                  </div>
                  <UBadge v-if="tasks.length" size="sm" color="neutral" variant="subtle" class="ml-auto">
                    {{ tasks.length }}
                  </UBadge>
                </div>
              </template>

              <form class="flex gap-3 mb-5" @submit.prevent="addTask">
                <UInput
                  v-model="newTaskTitle"
                  placeholder="What needs to be done?"
                  class="flex-1"
                  size="lg"
                />
                <UButton type="submit" :loading="isAdding" :disabled="!newTaskTitle.trim()" size="lg" class="px-6">
                  Add
                </UButton>
              </form>

              <div class="space-y-2 max-h-80 overflow-y-auto">
                <TransitionGroup name="list">
                  <div
                    v-for="task in tasks"
                    :key="task._id"
                    class="group flex items-center justify-between p-4 rounded-xl bg-muted border border-default hover:border-convex-purple/20 transition-colors"
                  >
                    <span class="text-default">{{ task.title }}</span>
                    <UButton
                      icon="i-heroicons-trash"
                      size="xs"
                      color="error"
                      variant="ghost"
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                      @click="deleteTask(task._id)"
                    />
                  </div>
                </TransitionGroup>
                <UEmpty
                  v-if="!tasks.length"
                  icon="i-heroicons-clipboard"
                  title="No tasks yet"
                  description="Add one above to get started"
                  class="py-8"
                />
              </div>
            </UCard>

            <!-- File Uploads Card -->
            <UCard class="card-gradient-border animate-fade-in-up animate-delay-200" :ui="{ body: 'p-6' }">
              <template #header>
                <div class="flex items-center gap-3">
                  <div class="size-10 rounded-xl bg-convex-pink/10 flex items-center justify-center">
                    <UIcon name="i-heroicons-photo" class="size-5 text-convex-pink" />
                  </div>
                  <div>
                    <h2 class="font-semibold text-highlighted">
                      Uploads
                    </h2>
                    <p class="text-xs text-dimmed">
                      NuxtHub storage
                    </p>
                  </div>
                  <UBadge v-if="uploads.length" size="sm" color="neutral" variant="subtle" class="ml-auto">
                    {{ uploads.length }}
                  </UBadge>
                </div>
              </template>

              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload">
              <button
                class="w-full p-6 rounded-xl border-2 border-dashed border-default hover:border-convex-pink/40 transition-colors mb-5 group"
                :class="{ 'border-convex-pink/40 bg-convex-pink/5': isUploading }"
                @click="fileInput?.click()"
              >
                <div class="flex flex-col items-center gap-2">
                  <div class="size-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-convex-pink/10 transition-colors">
                    <UIcon v-if="!isUploading" name="i-heroicons-arrow-up-tray" class="size-6 text-dimmed group-hover:text-convex-pink transition-colors" />
                    <UIcon v-else name="i-heroicons-arrow-path" class="size-6 text-convex-pink animate-spin" />
                  </div>
                  <span class="text-sm text-dimmed group-hover:text-muted transition-colors">
                    {{ isUploading ? 'Uploading...' : 'Click to upload an image' }}
                  </span>
                </div>
              </button>

              <UAlert v-if="uploadError" color="error" :title="uploadError.message" class="mb-4" />

              <div v-if="uploads.length" class="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                <TransitionGroup name="list">
                  <div v-for="file in uploads" :key="file._id" class="group relative rounded-xl overflow-hidden hover-lift">
                    <img
                      v-if="file.type?.startsWith('image/')"
                      :src="file.url"
                      :alt="file.name"
                      class="w-full h-28 object-cover"
                    >
                    <div v-else class="w-full h-28 bg-muted flex items-center justify-center">
                      <UIcon name="i-heroicons-document" class="size-8 text-dimmed" />
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <p class="text-xs text-inverted truncate flex-1 mr-2">
                        {{ file.name }}
                      </p>
                      <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="xs" @click="deleteUpload(file._id)" />
                    </div>
                  </div>
                </TransitionGroup>
              </div>
              <UEmpty
                v-else
                icon="i-heroicons-photo"
                title="No uploads yet"
                description="Images are stored with Convex"
                class="py-4"
              />
            </UCard>
          </div>

          <!-- Connection Info -->
          <div class="flex items-center justify-center gap-2 mt-10 text-xs text-dimmed animate-fade-in-up animate-delay-300">
            <span class="size-1.5 rounded-full bg-convex-green animate-pulse" />
            <span>Connected to</span>
            <code class="text-muted bg-muted px-2 py-0.5 rounded">{{ convexUrl }}</code>
          </div>

          <template #fallback>
            <div class="flex flex-col items-center justify-center py-20 gap-4">
              <USkeleton class="size-12 rounded-xl" />
              <USkeleton class="h-4 w-32" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-leave-active {
  position: absolute;
}
</style>
