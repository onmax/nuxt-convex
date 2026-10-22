<script setup lang="ts">
import { useConvexClient } from '#convex/advanced'
import { useConvexStorage } from '#convex/storage'

const config = useRuntimeConfig()
const convex = config.public.convex as { url?: string } | undefined
const available = [typeof useConvexQuery, typeof useConvexAuth, typeof useConvexStorage, typeof useConvexClient].join(',')
const event = useRequestEvent()
const tokenGetter = typeof event?.context.$convexToken
</script>

<template>
  <div>
    <span data-testid="url">{{ convex?.url }}</span>
    <span data-testid="available">{{ available }}</span>
    <span data-testid="token-getter">{{ tokenGetter }}</span>
  </div>
</template>
