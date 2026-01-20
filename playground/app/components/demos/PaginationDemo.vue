<script setup lang="ts">
import type { Id } from '../../../convex/_generated/dataModel'
import { api } from '#convex/api'

const toast = useToast()
const { user } = useUserSession()
const userId = computed(() => user.value?.id || '')

// Paginated query composable
const { data, pages, isDone, isLoadingMore, loadMore, reset, isLoading } = useConvexPaginatedQuery(
  api.tasks.listPaginated,
  computed(() => ({ userId: userId.value })),
  { numItems: 5 },
)

// Seed mutation for demo
const { mutate: seedTasks, isLoading: isSeeding } = useConvexMutation(api.tasks.seed, {
  onSuccess: (count) => {
    toast.add({ title: `Created ${count} sample tasks`, color: 'success' })
    reset()
  },
})

// Delete all for cleanup
const { mutate: deleteTask } = useConvexMutation(api.tasks.remove)
const isClearing = ref(false)

async function clearAll() {
  if (!data.value?.length)
    return
  isClearing.value = true
  try {
    await Promise.all(data.value.map(task => deleteTask({ id: task._id as Id<'tasks'> })))
  }
  finally {
    isClearing.value = false
    reset()
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Composable Demo -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-list-bullet" class="text-primary" />
            <span class="font-semibold">useConvexPaginatedQuery</span>
          </div>
          <div class="flex items-center gap-2">
            <UButton size="xs" variant="outline" :loading="isSeeding" @click="seedTasks({ userId, count: 25 })">
              Seed 25 Tasks
            </UButton>
            <UButton size="xs" variant="outline" color="error" :loading="isClearing" :disabled="!data?.length" @click="clearAll">
              Clear All
            </UButton>
          </div>
        </div>
      </template>

      <div class="text-sm text-muted mb-4">
        Load data in pages with <code class="bg-muted px-1 rounded">loadMore()</code>. Great for infinite scroll.
      </div>

      <div v-if="isLoading && !data?.length" class="flex items-center gap-2 text-muted py-4">
        <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
        Loading first page...
      </div>

      <div v-else-if="data?.length" class="space-y-4">
        <div class="space-y-2">
          <div v-for="task in data" :key="task._id" class="p-2 rounded bg-muted text-sm">
            {{ task.title }}
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-default">
          <div class="text-xs text-muted">
            Showing {{ data.length }} items across {{ pages.length }} page(s)
          </div>
          <UButton v-if="!isDone" size="sm" :loading="isLoadingMore" @click="loadMore">
            Load More
          </UButton>
          <UBadge v-else color="success" variant="subtle">
            All loaded
          </UBadge>
        </div>
      </div>

      <UEmpty v-else icon="i-heroicons-list-bullet" title="No tasks" description="Click 'Seed 25 Tasks' to populate data" class="py-6" />
    </UCard>

    <!-- State Indicators -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-signal" class="text-info" />
          <span class="font-semibold">Pagination State</span>
        </div>
      </template>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="flex flex-col gap-1">
          <span class="text-muted">isLoading</span>
          <UBadge :color="isLoading ? 'warning' : 'neutral'" variant="subtle">
            {{ isLoading }}
          </UBadge>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-muted">isLoadingMore</span>
          <UBadge :color="isLoadingMore ? 'warning' : 'neutral'" variant="subtle">
            {{ isLoadingMore }}
          </UBadge>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-muted">isDone</span>
          <UBadge :color="isDone ? 'success' : 'neutral'" variant="subtle">
            {{ isDone }}
          </UBadge>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-muted">pages.length</span>
          <UBadge color="neutral" variant="subtle">
            {{ pages.length }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- Component Demo -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-code-bracket" class="text-warning" />
          <span class="font-semibold">&lt;ConvexPaginatedQuery&gt; Component</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-4">
        Renderless component with slots for all states and pagination controls in slot props.
      </div>

      <ConvexPaginatedQuery :query="api.tasks.listPaginated" :args="{ userId }" :options="{ numItems: 3 }">
        <template #loading>
          <div class="flex items-center gap-2 text-muted py-4">
            <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
            Loading...
          </div>
        </template>
        <template #error="{ error, reset: resetError }">
          <UAlert color="error" :title="error.message">
            <template #actions>
              <UButton size="xs" @click="resetError">
                Retry
              </UButton>
            </template>
          </UAlert>
        </template>
        <template #empty>
          <UEmpty icon="i-heroicons-list-bullet" title="No tasks" class="py-4" />
        </template>
        <template #default="{ data: items, isDone: done, isLoadingMore: loadingMore, loadMore: more }">
          <div class="space-y-2">
            <div v-for="task in items.slice(0, 5)" :key="task._id" class="p-2 rounded bg-muted text-sm">
              {{ task.title }}
            </div>
            <div v-if="items.length > 5" class="text-xs text-muted">
              ... and {{ items.length - 5 }} more
            </div>
            <UButton v-if="!done" size="sm" :loading="loadingMore" class="mt-2" @click="more">
              Load More (Component)
            </UButton>
          </div>
        </template>
      </ConvexPaginatedQuery>
    </UCard>

    <!-- Reset -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-path" class="text-secondary" />
          <span class="font-semibold">reset() Function</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-4">
        Call <code class="bg-muted px-1 rounded">reset()</code> to clear all pages and start fresh from page 1.
      </div>

      <UButton variant="outline" @click="reset">
        Reset Pagination
      </UButton>
    </UCard>
  </div>
</template>
