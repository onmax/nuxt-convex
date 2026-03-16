<script setup lang="ts">
import { useConvexClient } from '#convex/advanced'
import { useConvexStorage } from '#convex/storage'

const config = useRuntimeConfig()
const convex = config.public.convex as { url?: string, server?: boolean, storage?: boolean } | undefined
const available = [typeof useConvexQuery, typeof useConvexAuth, typeof useConvexStorage, typeof useConvexClient].join(',')
</script>

<template>
  <div>
    <span data-testid="url">{{ convex?.url }}</span>
    <span data-testid="available">{{ available }}</span>
  </div>
</template>
