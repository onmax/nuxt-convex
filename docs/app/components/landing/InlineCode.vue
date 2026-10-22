<script setup lang="ts">
// Renders a plain string, turning `backtick` spans into <code>. Landing copy lives in YAML props,
// where markdown isn't parsed.
const props = defineProps<{ text: string }>()

const parts = computed(() => props.text.split(/(`[^`]+`)/).filter(Boolean).map(part =>
  part.startsWith('`') ? { code: true, value: part.slice(1, -1) } : { code: false, value: part },
))
</script>

<template>
  <template v-for="(part, index) in parts" :key="index">
    <code
      v-if="part.code"
      class="rounded-md bg-elevated px-1.5 py-0.5 font-mono text-[0.85em] text-highlighted ring-1 ring-default ring-inset"
    >{{ part.value }}</code>
    <template v-else>
      {{ part.value }}
    </template>
  </template>
</template>
