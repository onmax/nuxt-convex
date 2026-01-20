<script setup lang="ts">
defineProps<{ showUser?: boolean }>()

const { user, signOut } = useUserSession()
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4">
    <div class="flex items-center gap-4">
      <a href="https://nuxt.com" target="_blank" class="flex items-center gap-1.5 text-muted hover:text-nuxt">
        <UIcon name="i-simple-icons-nuxtdotjs" class="size-5" />
        <span class="text-sm font-medium hidden sm:block">Nuxt</span>
      </a>
      <a href="https://convex.dev" target="_blank" class="flex items-center gap-1.5 text-muted hover:text-convex">
        <UIcon name="i-custom-convex" class="size-4" />
        <span class="text-sm font-medium hidden sm:block">Convex</span>
      </a>
      <template v-if="showUser">
        <USeparator orientation="vertical" class="h-5" />
        <UBadge color="success" variant="subtle">
          <span class="size-1.5 rounded-full bg-success animate-pulse mr-1.5" />
          Connected
        </UBadge>
      </template>
    </div>
    <div class="flex items-center gap-3">
      <UButton to="https://nuxt-convex.onmax.me" target="_blank" variant="ghost" color="neutral" size="sm">
        Docs
      </UButton>
      <UButton to="https://github.com/onmax/nuxt-convex" target="_blank" icon="i-simple-icons-github" variant="ghost" color="neutral" size="sm" />
      <UColorModeButton />
      <template v-if="showUser && user">
        <USeparator orientation="vertical" class="h-6" />
        <UAvatar :src="user.image" :alt="user.name" size="sm" />
        <span class="text-sm text-muted hidden sm:block">{{ user.name }}</span>
        <UButton size="sm" variant="ghost" color="neutral" icon="i-heroicons-arrow-right-on-rectangle" @click="signOut()">
          <span class="sr-only sm:not-sr-only">Sign out</span>
        </UButton>
      </template>
    </div>
  </header>
</template>
