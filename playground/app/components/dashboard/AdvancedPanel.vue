<script setup lang="ts">
import { api } from '#convex/api'

const toast = useToast()
const { user } = useUserSession()
const userId = computed(() => user.value?.id ?? '')
const taskArgs = computed(() => userId.value ? { userId: userId.value } : 'skip' as const)

// Section A: useConvexQueries — batch multiple queries
const { data: batchData, errors: batchErrors } = useConvexQueries(computed(() => ({
  tasks: { query: api.tasks.list, args: taskArgs.value },
  stats: { query: api.tasks.stats, args: taskArgs.value },
})))

// Section B: useConvexAction
const { execute: runSummarize, isPending: isSummarizing, error: summarizeError } = useConvexAction(api.tasks.summarize)
const summaryResult = ref<string | null>(null)
async function handleSummarize() {
  if (!userId.value)
    return
  summaryResult.value = null
  try {
    summaryResult.value = await runSummarize({ userId: userId.value })
  }
  catch (e) {
    toast.add({ color: 'error', title: 'Action failed', description: e instanceof Error ? e.message : 'Unknown error' })
  }
}

// Section E: useConvexClient + useConvexHttpClient
const httpQueryResult = ref<string | null>(null)
const isHttpQuerying = ref(false)
async function runHttpQuery() {
  if (!userId.value)
    return
  isHttpQuerying.value = true
  try {
    const { useConvexHttpClient } = await import('#convex/advanced')
    const httpClient = useConvexHttpClient()
    const result = await httpClient.query(api.tasks.stats, { userId: userId.value })
    httpQueryResult.value = JSON.stringify(result, null, 2)
  }
  catch (e) {
    httpQueryResult.value = `Error: ${e instanceof Error ? e.message : 'Unknown'}`
  }
  finally {
    isHttpQuerying.value = false
  }
}

// Section F: Optimistic update with insertAtTop
const optimisticTitle = ref('')
const { mutate: addTaskOptimistic, isPending: isOptimisticAdding } = useConvexMutation(api.tasks.add, {
  optimisticUpdate: async (localStore, args) => {
    const { insertAtTop } = await import('@onmax/convex-vue')
    insertAtTop({
      paginatedQuery: api.tasks.listPaginated,
      argsToMatch: { userId: args.userId },
      localQueryStore: localStore,
      item: { _id: crypto.randomUUID() as any, _creationTime: Date.now(), title: args.title, userId: args.userId, createdAt: Date.now() },
    })
  },
})
const { data: optimisticTasks, isDone: optimisticIsDone, isLoadingMore: optimisticLoading, loadMore: optimisticLoadMore } = useConvexPaginatedQuery(api.tasks.listPaginated, taskArgs, { numItems: 5 })
async function addWithOptimistic() {
  const title = optimisticTitle.value.trim()
  if (!title || !userId.value)
    return
  try {
    await addTaskOptimistic({ title, userId: userId.value })
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
          <ConvexQuery :query="api.tasks.list" :args="taskArgs" :options="{ server: false }">
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
          <ConvexPaginatedQuery :query="api.tasks.listPaginated" :args="taskArgs" :options="{ numItems: 3 }">
            <template #default="{ data, isDone, isLoadingMore, loadMore }">
              <div class="space-y-1">
                <div v-for="task in data" :key="task._id" class="rounded-md border border-default bg-elevated/50 px-3 py-2">
                  <p class="text-sm font-medium text-highlighted">
                    {{ task.title }}
                  </p>
                </div>
                <div class="flex items-center gap-3 pt-2">
                  <UButton v-if="!isDone" size="xs" :loading="isLoadingMore" @click="loadMore">
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

        <!-- Section E: useConvexClient + useConvexHttpClient -->
        <section class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              Raw clients
            </h3>
            <span class="text-sm text-muted">useConvexClient / useConvexHttpClient</span>
          </div>
          <div class="flex items-center gap-3">
            <UButton size="sm" :loading="isHttpQuerying" @click="runHttpQuery">
              One-shot HTTP query
            </UButton>
          </div>
          <pre v-if="httpQueryResult" class="rounded-md border border-default bg-elevated/50 p-3 text-xs text-highlighted overflow-auto max-h-32">{{ httpQueryResult }}</pre>
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
              <UButton v-if="!optimisticIsDone" size="xs" :loading="optimisticLoading" @click="optimisticLoadMore">
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
