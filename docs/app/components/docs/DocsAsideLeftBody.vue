<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
const { filterNavigation } = useDocsModules()

const filteredNavigation = computed(() => filterNavigation(navigation?.value))
</script>

<template>
  <UContentNavigation
    highlight
    :navigation="filteredNavigation"
  />
</template>
