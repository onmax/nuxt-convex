<script setup lang="ts">
// Test auto-imports work
const config = useRuntimeConfig()
const convex = config.public.convex as { url?: string, server?: boolean, storage?: boolean } | undefined
const available = [typeof useConvexClient, typeof useConvexQuery, typeof useConvexStorage].join(',')
</script>

<template>
  <div>
    <span data-testid="url">{{ convex?.url }}</span>
    <span data-testid="available">{{ available }}</span>
  </div>
</template>
