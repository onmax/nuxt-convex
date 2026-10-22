<script setup lang="ts">
import { insertAtTop } from '#convex'
import { api } from '#convex/api'

const toast = useToast()
const { user } = useUserSession()

// Section A: useConvexQueries — batch multiple queries
const { data: batchData, errors: batchErrors } = useConvexQueries({
  tasks: { query: api.tasks.list, args: {} },
  stats: { query: api.tasks.stats, args: {} },
})

// Section B: useConvexAction
const { execute: runSummarize, isPending: isSummarizing, error: summarizeError } = useConvexAction(api.tasks.summarize)
const summaryResult = ref<string | null>(null)
async function handleSummarize() {
  summaryResult.value = null
  try {
    summaryResult.value = await runSummarize({})
  }
  catch (e) {
    toast.add({ color: 'error', title: 'Action failed', description: e instanceof Error ? e.message : 'Unknown error' })
  }
}

// Section E: a Nitro route calling Convex as the signed-in user (server/api/tasks/stats.get.ts)
const { data: serverStats, error: serverStatsError, status: serverStatsStatus, refresh: refreshServerStats } = useFetch('/api/tasks/stats', { server: false, immediate: false })

// Section F: Optimistic update with insertAtTop
const optimisticTitle = ref('')
const { mutate: addTaskOptimistic, isPending: isOptimisticAdding } = useConvexMutation(api.tasks.add, {
  optimisticUpdate: (localStore, args) => {
    insertAtTop({
      paginatedQuery: api.tasks.listPaginated,
      argsToMatch: {},
      localQueryStore: localStore,
      item: { _id: crypto.randomUUID() as any, _creationTime: Date.now(), title: args.title, userId: user.value?.id, createdAt: Date.now() },
    })
  },
})
const { data: optimisticTasks, isDone: optimisticIsDone, isLoadingMore: optimisticLoading, loadMore: optimisticLoadMore } = useConvexPaginatedQuery(api.tasks.listPaginated, {}, { numItems: 5 })
async function addWithOptimistic() {
  const title = optimisticTitle.value.trim()
  if (!title)
    return
  try {
    await addTaskOptimistic({ title })
    optimisticTitle.value = ''
    toast.add({ color: 'success', title: 'Task created (optimistic)' })
  }
  catch (e) {
    toast.add({ color: 'error', title: 'Failed', description: e instanceof Error ? e.message : 'Unknown' })
  }
}
</script>

<template>
  <UDashboardPanel id="advanced">
    <template #header>
      <UDashboardNavbar title="Advanced">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UBadge color="neutral" variant="subtle">
            Feature parity demos
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="grid gap-6 xl:grid-cols-2">
        <!-- Section A: useConvexQueries -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              Batch queries
            </h3>
            <span class="text-sm text-muted">useConvexQueries</span>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-md border border-default bg-elevated/50 px-4 py-3">
              <p class="text-xs text-dimmed">
                Tasks count (from list)
              </p>
              <p class="mt-1 text-lg font-semibold text-highlighted">
                {{ batchData?.tasks?.length ?? '—' }}
              </p>
            </div>
            <div class="rounded-md border border-default bg-elevated/50 px-4 py-3">
              <p class="text-xs text-dimmed">
                Stats (from stats)
              </p>
              <p class="mt-1 text-sm font-medium text-highlighted">
                Total: {{ batchData?.stats?.total ?? '—' }}
              </p>
              <p v-if="batchData?.stats?.newest" class="text-xs text-muted">
                Latest: {{ new Date(batchData.stats.newest).toLocaleString() }}
              </p>
            </div>
          </div>
          <div v-if="batchErrors?.tasks || batchErrors?.stats" class="text-sm text-error">
            {{ batchErrors?.tasks?.message || batchErrors?.stats?.message }}
          </div>
        </section>

        <!-- Section B: useConvexAction -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              Server action
            </h3>
            <span class="text-sm text-muted">useConvexAction</span>
          </div>
          <div class="flex items-center gap-3">
            <UButton size="sm" :loading="isSummarizing" @click="handleSummarize">
              Run summarize
            </UButton>
            <span v-if="summaryResult" class="text-sm text-highlighted">{{ summaryResult }}</span>
            <span v-if="summarizeError" class="text-sm text-error">{{ summarizeError.message }}</span>
          </div>
        </section>

        <!-- Section C: <ConvexQuery> component -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              Declarative query
            </h3>
            <span class="text-sm text-muted">&lt;ConvexQuery&gt;</span>
          </div>
          <ConvexQuery :query="api.tasks.list" :args="{}">
            <template #default="{ data }">
              <div class="space-y-1">
                <div v-for="task in (data as any[]).slice(0, 4)" :key="task._id" class="rounded-md border border-default bg-elevated/50 px-3 py-2">
                  <p class="text-sm font-medium text-highlighted">
                    {{ task.title }}
                  </p>
                </div>
                <p v-if="(data as any[]).length > 4" class="text-xs text-muted">
                  +{{ (data as any[]).length - 4 }} more
                </p>
              </div>
            </template>
            <template #loading>
              <div class="flex items-center gap-2 py-6 text-muted">
                <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
                Loading...
              </div>
            </template>
            <template #empty>
              <UEmpty icon="i-lucide-clipboard-list" title="No tasks" description="Create tasks from the Tasks page." class="py-6" />
            </template>
          </ConvexQuery>
        </section>

        <!-- Section D: <ConvexPaginatedQuery> component -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              Declarative paginated query
            </h3>
            <span class="text-sm text-muted">&lt;ConvexPaginatedQuery&gt;</span>
          </div>
          <ConvexPaginatedQuery :query="api.tasks.listPaginated" :args="{}" :options="{ numItems: 3 }">
            <template #default="{ data, isDone, isLoadingMore, loadMore }">
              <div class="space-y-1">
                <div v-for="task in data" :key="task._id" class="rounded-md border border-default bg-elevated/50 px-3 py-2">
                  <p class="text-sm font-medium text-highlighted">
                    {{ task.title }}
                  </p>
                </div>
                <div class="flex items-center gap-3 pt-2">
                  <UButton v-if="!isDone" size="xs" :loading="isLoadingMore" @click="loadMore()">
                    Load more
                  </UButton>
                  <UBadge v-else color="success" variant="subtle">
                    All loaded
                  </UBadge>
                  <span class="text-xs text-muted">{{ data.length }} shown</span>
                </div>
              </div>
            </template>
            <template #loading>
              <div class="flex items-center gap-2 py-6 text-muted">
                <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
                Loading...
              </div>
            </template>
            <template #empty>
              <UEmpty icon="i-lucide-list" title="No tasks" description="Seed data from the Tasks page." class="py-6" />
            </template>
          </ConvexPaginatedQuery>
        </section>

        <!-- Section E: Nitro server helpers -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              Server route
            </h3>
            <span class="text-sm text-muted">serverConvexQuery / requireConvexAuth</span>
          </div>
          <div class="flex items-center gap-3">
            <UButton size="sm" :loading="serverStatsStatus === 'pending'" @click="refreshServerStats()">
              GET /api/tasks/stats
            </UButton>
          </div>
          <pre v-if="serverStats" class="rounded-md border border-default bg-elevated/50 p-3 text-xs text-highlighted overflow-auto max-h-32">{{ serverStats }}</pre>
          <p v-if="serverStatsError" class="text-sm text-error">
            {{ serverStatsError.statusCode }}: {{ serverStatsError.statusMessage || serverStatsError.message }}
          </p>
        </section>

        <!-- Section F: Optimistic update with insertAtTop -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              Optimistic update
            </h3>
            <span class="text-sm text-muted">insertAtTop</span>
          </div>
          <form class="flex items-center gap-2" @submit.prevent="addWithOptimistic">
            <UInput v-model="optimisticTitle" placeholder="Task title..." class="w-48" />
            <UButton type="submit" size="sm" :loading="isOptimisticAdding" :disabled="!optimisticTitle.trim()">
              Add (optimistic)
            </UButton>
          </form>
          <div v-if="optimisticTasks.length" class="space-y-1">
            <div v-for="task in optimisticTasks" :key="task._id" class="rounded-md border border-default bg-elevated/50 px-3 py-2">
              <p class="text-sm font-medium text-highlighted">
                {{ task.title }}
              </p>
              <p class="text-xs text-dimmed">
                {{ new Date(task.createdAt).toLocaleString() }}
              </p>
            </div>
            <div class="flex items-center gap-3 pt-2">
              <UButton v-if="!optimisticIsDone" size="xs" :loading="optimisticLoading" @click="optimisticLoadMore()">
                Load more
              </UButton>
              <UBadge v-else color="success" variant="subtle">
                All loaded
              </UBadge>
            </div>
          </div>
          <UEmpty v-else icon="i-lucide-zap" title="No tasks yet" description="Add a task to see optimistic updates." class="py-6" />
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
