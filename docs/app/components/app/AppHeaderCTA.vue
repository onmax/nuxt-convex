<script setup lang="ts">
const { isModuleActive, modules } = useDocsModules()
</script>

<template>
  <div
    v-if="modules.length"
    class="hidden items-center gap-1.5 lg:flex"
  >
    <UButton
      v-for="module in modules"
      :key="module.id"
      size="sm"
      :label="module.label"
      :to="module.to"
      :color="isModuleActive(module) ? 'primary' : 'neutral'"
      :variant="isModuleActive(module) ? 'soft' : 'ghost'"
    />
  </div>
</template>
