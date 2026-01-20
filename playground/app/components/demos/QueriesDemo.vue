<script setup lang="ts">
import { api } from '#convex/api'

const { user } = useUserSession()
const userId = computed(() => user.value?.id || '')

// SSR-enabled query (default)
const { data: tasksSSR, pending: pendingSSR } = await useConvexQuery(api.tasks.list, computed(() => ({ userId: userId.value })))

// Client-only query (ssr: false)
const { data: tasksClient, pending: pendingClient } = await useConvexQuery(api.tasks.list, computed(() => ({ userId: userId.value })), { ssr: false })

// Reactive args demo - showCompleted is used in UI to demonstrate computed() args pattern
const showCompleted = ref(false)
const filterArgs = computed(() => ({ userId: userId.value }))
</script>

<template>
  <div class="space-y-6">
    <!-- SSR Query -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-server" class="text-primary" />
          <span class="font-semibold">useConvexQuery (SSR enabled)</span>
          <UBadge color="success" variant="subtle" size="xs">
            Default
          </UBadge>
        </div>
      </template>

      <div class="text-sm text-muted mb-3">
        Data fetched on server and hydrated. Check "view source" to see pre-rendered content.
      </div>

      <div v-if="pendingSSR" class="flex items-center gap-2 text-muted">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        Loading...
      </div>
      <div v-else-if="tasksSSR?.length" class="space-y-2">
        <div v-for="task in tasksSSR.slice(0, 3)" :key="task._id" class="p-2 rounded bg-muted text-sm">
          {{ task.title }}
        </div>
        <div v-if="tasksSSR.length > 3" class="text-xs text-muted">
          ... and {{ tasksSSR.length - 3 }} more
        </div>
      </div>
      <UEmpty v-else icon="i-heroicons-clipboard" title="No tasks" description="Add some tasks in the Mutations tab" class="py-4" />
    </UCard>

    <!-- Client-only Query -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-computer-desktop" class="text-secondary" />
          <span class="font-semibold">useConvexQuery (ssr: false)</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-3">
        Data fetched only on client. Useful for user-specific data that shouldn't be SSR'd.
      </div>

      <div v-if="pendingClient" class="flex items-center gap-2 text-muted">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        Loading...
      </div>
      <div v-else-if="tasksClient?.length" class="text-sm text-muted">
        {{ tasksClient.length }} tasks loaded client-side
      </div>
      <UEmpty v-else icon="i-heroicons-clipboard" title="No tasks" class="py-4" />
    </UCard>

    <!-- ConvexQuery Component -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-code-bracket" class="text-warning" />
          <span class="font-semibold">&lt;ConvexQuery&gt; Component</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-3">
        Renderless component with slots for loading, error, empty, and default states.
      </div>

      <ConvexQuery :query="api.tasks.list" :args="filterArgs">
        <template #loading>
          <div class="flex items-center gap-2 text-muted py-4">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
            Loading via component...
          </div>
        </template>
        <template #error="{ error }">
          <UAlert color="error" :title="error.message" />
        </template>
        <template #empty>
          <UEmpty icon="i-heroicons-clipboard" title="No tasks" class="py-4" />
        </template>
        <template #default="{ data }">
          <div class="space-y-2">
            <div v-for="task in data.slice(0, 3)" :key="task._id" class="p-2 rounded bg-muted text-sm">
              {{ task.title }}
            </div>
            <div v-if="data.length > 3" class="text-xs text-muted">
              ... and {{ data.length - 3 }} more
            </div>
          </div>
        </template>
      </ConvexQuery>
    </UCard>

    <!-- Reactive Args -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-path" class="text-info" />
          <span class="font-semibold">Reactive Arguments</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-3">
        Use <code class="bg-muted px-1 rounded">computed()</code> for args to automatically re-fetch when dependencies change.
      </div>

      <div class="flex items-center gap-4">
        <USwitch v-model="showCompleted" />
        <span class="text-sm">Toggle state: {{ showCompleted ? 'ON' : 'OFF' }}</span>
      </div>
      <p class="text-xs text-muted mt-2">
        In a real app, this would filter tasks based on completed status.
      </p>
    </UCard>
  </div>
</template>
