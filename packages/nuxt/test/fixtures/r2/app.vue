<script setup lang="ts">
const config = useRuntimeConfig()
const convex = config.public.convex as { url?: string } | undefined
const available = [typeof useConvexQuery, typeof useConvexR2Upload].join(',')
</script>

<template>
  <div>
    <span data-testid="url">{{ convex?.url }}</span>
    <span data-testid="available">{{ available }}</span>
  </div>
</template>
