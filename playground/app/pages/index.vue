<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const { signIn } = useUserSession()

const features = [
  { icon: 'i-heroicons-bolt', title: 'Realtime', description: 'Live subscriptions sync data instantly across all clients' },
  { icon: 'i-heroicons-cloud-arrow-up', title: 'File Storage', description: 'Upload files directly to Convex with NuxtHub' },
  { icon: 'i-heroicons-shield-check', title: 'Auth Ready', description: 'Seamless better-auth integration' },
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-default">
    <AppHeader />

    <div class="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div class="flex items-center gap-4 mb-8">
        <UIcon name="i-simple-icons-nuxtdotjs" class="size-12 text-nuxt" />
        <span class="text-2xl text-muted">+</span>
        <UIcon name="i-custom-convex" class="size-10 text-convex" />
      </div>

      <h1 class="text-5xl sm:text-6xl font-bold text-highlighted mb-4 text-center">
        nuxt-convex
      </h1>
      <p class="text-xl text-muted mb-10 text-center max-w-md">
        Realtime data & file storage for Nuxt
      </p>

      <UButton size="xl" color="primary" icon="i-simple-icons-github" @click="signIn.social({ provider: 'github' })">
        Continue with GitHub
      </UButton>

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
</template>
