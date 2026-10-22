<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
    <p v-if="eyebrow" class="mb-3 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-primary">
      {{ eyebrow }}
    </p>
    <h2 class="text-3xl/[1.15] font-semibold tracking-[-0.02em] text-highlighted sm:text-4xl/[1.12]">
      {{ title }}
    </h2>
    <p v-if="description" class="mt-4 text-base/7 text-muted sm:text-lg/8">
      <LandingInlineCode :text="description" />
    </p>
  </div>
</template>
