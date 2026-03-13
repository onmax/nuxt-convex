<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const { activeModule, activeTabs, filterNavigation, isModuleActive, isTabActive, modules } = useDocsModules()

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

    <div
      v-if="activeModule && activeTabs.length"
      class="flex flex-wrap gap-2 border-t border-default pt-4"
    >
      <UButton
        v-for="tab in activeTabs"
        :key="tab.to"
        :to="tab.to"
        size="sm"
        :label="tab.label"
        :color="isTabActive(tab) ? 'primary' : 'neutral'"
        :variant="isTabActive(tab) ? 'soft' : 'ghost'"
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
