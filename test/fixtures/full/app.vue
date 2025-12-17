<script setup lang="ts">
// Test auto-imports work
const config = useRuntimeConfig()
const convex = config.public.convex as { url?: string } | undefined
</script>

<template>
  <div>
    <span data-testid="url">{{ convex?.url }}</span>
  </div>
</template>
