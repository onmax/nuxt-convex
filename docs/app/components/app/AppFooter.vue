<script setup lang="ts">
const links = [
  { label: 'GitHub', to: 'https://github.com/onmax/nuxt-convex', icon: 'i-simple-icons-github' },
  { label: 'nuxt-convex', to: 'https://www.npmjs.com/package/nuxt-convex', icon: 'i-simple-icons-npm' },
  { label: 'vue-convex', to: 'https://www.npmjs.com/package/vue-convex', icon: 'i-simple-icons-npm' },
  { label: 'Convex docs', to: 'https://docs.convex.dev', icon: 'i-simple-icons-convex' },
]
</script>

<template>
  <UFooter
    class="border-t border-default"
    :ui="{ top: 'py-0', bottom: 'py-0', container: 'py-6 lg:py-6' }"
  >
    <template #left>
      <p class="text-sm text-muted">
        MIT License · © {{ new Date().getFullYear() }} nuxt-convex
      </p>
    </template>

    <nav aria-label="Project links" class="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
      <UButton
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        target="_blank"
        :icon="link.icon"
        :label="link.label"
        color="neutral"
        variant="ghost"
        size="sm"
        :ui="{ leadingIcon: 'size-3.5' }"
      />
    </nav>

    <template #right>
      <ClientOnly>
        <UColorModeButton size="sm" />
        <template #fallback>
          <div class="size-8" />
        </template>
      </ClientOnly>
    </template>
  </UFooter>
</template>
