<script setup lang="ts">
const config = useRuntimeConfig()
const convex = config.public.convex as { url?: string } | undefined
const available = [typeof useConvexQuery, typeof useConvexR2Upload].join(',')
// Called during SSR on purpose: it must not need the browser-only client at setup
const { isUploading } = useConvexR2Upload({ generateUploadUrl: {}, syncMetadata: {} } as any)
</script>

<template>
  <div>
    <span data-testid="url">{{ convex?.url }}</span>
    <span data-testid="available">{{ available }}</span>
    <span data-testid="uploading">{{ isUploading }}</span>
  </div>
</template>
