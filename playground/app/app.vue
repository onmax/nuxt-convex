<script setup lang="ts">
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <UApp>
    <UContainer class="py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold">
          nuxt-convex Playground
        </h1>
        <UButton
          :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'"
          variant="ghost"
          @click="toggleColorMode"
        />
      </div>
      <NuxtPage />
    </UContainer>
    <UNotifications />
  </UApp>
</template>
