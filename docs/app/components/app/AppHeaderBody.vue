<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const { filterNavigation, isModuleActive, modules } = useDocsModules()

const filteredNavigation = computed(() => filterNavigation(navigation?.value))
</script>

<template>
  <div class="flex flex-col gap-4 py-4 lg:hidden">
    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="module in modules"
        :key="module.id"
        :to="module.to"
        size="sm"
        :label="module.label"
        :color="isModuleActive(module) ? 'primary' : 'neutral'"
        :variant="isModuleActive(module) ? 'soft' : 'ghost'"
      />
    </div>

    <UContentNavigation
      v-if="filteredNavigation.length"
      highlight
      variant="link"
      :navigation="filteredNavigation"
    />
  </div>
</template>
