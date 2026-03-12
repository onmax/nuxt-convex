<script setup lang="ts">
const appConfig = useAppConfig()

const links = computed(() => appConfig.header?.links ?? [])
</script>

<template>
  <div
    v-if="links.length"
    class="hidden xl:flex items-center gap-1.5"
  >
    <UButton
      v-for="(link, index) in links"
      :key="index"
      size="sm"
      v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
    />
  </div>
</template>
