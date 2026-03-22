<script setup lang="ts">
import type { Id } from '../../../convex/_generated/dataModel'
import { api } from '#convex/api'

const toast = useToast()
const { user } = useUserSession()
const userId = computed(() => user.value?.id ?? '')
const taskArgs = computed(() => userId.value ? { userId: userId.value } : 'skip' as const)

const form = reactive({ title: '', seedCount: 18 })

const { data: allTasks, isPending } = useConvexQuery(api.tasks.list, taskArgs)
const {
  data: paginatedTasks,
  pages,
  isDone,
  isLoadingMore,
  loadMore,
  reset,
  isPending: isPaginationPending,
} = useConvexPaginatedQuery(api.tasks.listPaginated, taskArgs, { numItems: 6 })

const { mutate: addTask, isPending: isCreating } = useConvexMutation(api.tasks.add)
const { mutate: removeTask, isPending: isRemoving } = useConvexMutation(api.tasks.remove)
const { mutate: seedTasks, isPending: isSeeding } = useConvexMutation(api.tasks.seed)
const { mutate: clearAllTasks, isPending: isClearing } = useConvexMutation(api.tasks.clearAll)

const headlineTasks = computed(() => allTasks.value?.slice(0, 5) ?? [])
const totalTasks = computed(() => allTasks.value?.length ?? 0)
const remainingTasks = computed(() => Math.max(totalTasks.value - headlineTasks.value.length, 0))
const hasTasks = computed(() => totalTasks.value > 0)

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Please try again.'
}

async function createTask() {
  const title = form.title.trim()
  if (!title || !userId.value)
    return
  try {
    await addTask({ title, userId: userId.value })
    form.title = ''
    reset()
    toast.add({ color: 'success', title: 'Task created' })
  }
  catch (error) {
    toast.add({ color: 'error', title: 'Task creation failed', description: getErrorMessage(error) })
  }
}

async function removeTaskById(id: Id<'tasks'>) {
  try {
    await removeTask({ id })
    reset()
  }
  catch (error) {
    toast.add({ color: 'error', title: 'Deletion failed', description: getErrorMessage(error) })
  }
}

async function seedSampleTasks() {
  if (!userId.value)
    return
  const count = Math.min(Math.max(Math.round(form.seedCount), 1), 50)
  try {
    const created = await seedTasks({ userId: userId.value, count })
    form.seedCount = count
    reset()
    toast.add({ color: 'success', title: `${created} sample tasks created` })
  }
  catch (error) {
    toast.add({ color: 'error', title: 'Seeding failed', description: getErrorMessage(error) })
  }
}

async function clearTasks() {
  if (!userId.value)
    return
  try {
    const removed = await clearAllTasks({ userId: userId.value })
    reset()
    toast.add({ color: 'success', title: `Cleared ${removed} task${removed === 1 ? '' : 's'}` })
  }
  catch (error) {
    toast.add({ color: 'error', title: 'Clear failed', description: getErrorMessage(error) })
  }
}
</script>

<template>
  <UDashboardPanel id="tasks">
    <template #header>
      <UDashboardNavbar title="Tasks">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UBadge color="neutral" variant="subtle">
            {{ totalTasks }} total
          </UBadge>

          <UButton size="sm" color="neutral" variant="soft" :loading="isSeeding" @click="seedSampleTasks">
            Seed {{ form.seedCount }}
          </UButton>

          <UButton size="sm" color="neutral" variant="ghost" :loading="isClearing" :disabled="!hasTasks" @click="clearTasks">
            Clear all
          </UButton>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <form class="flex items-center gap-2" @submit.prevent="createTask">
            <UInput v-model="form.title" placeholder="New task title..." class="w-64" />
            <UButton type="submit" size="sm" :loading="isCreating" :disabled="!form.title.trim()">
              Create
            </UButton>
          </form>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="grid gap-6 xl:grid-cols-2">
        <!-- Live feed -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              Live feed
            </h3>
            <span class="text-sm text-muted">useConvexQuery</span>
          </div>

          <div v-if="isPending && !hasTasks" class="flex items-center gap-2 py-10 text-muted">
            <UIcon name="i-lucide-loader" class="size-5 animate-spin" />
            Loading tasks...
          </div>

          <div v-else-if="hasTasks" class="space-y-2">
            <div
              v-for="task in headlineTasks"
              :key="task._id"
              class="flex items-center justify-between gap-3 rounded-md border border-default bg-elevated/50 px-4 py-3"
            >
              <div>
                <p class="font-medium text-highlighted">
                  {{ task.title }}
                </p>
                <p class="text-xs text-dimmed">
                  {{ new Date(task.createdAt).toLocaleString() }}
                </p>
              </div>
              <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" :loading="isRemoving" @click="removeTaskById(task._id)" />
            </div>

            <p v-if="remainingTasks" class="text-sm text-muted">
              +{{ remainingTasks }} more in paginated archive
            </p>
          </div>

          <UEmpty v-else icon="i-lucide-clipboard-list" title="No tasks yet" description="Create a task or seed sample data." class="py-10" />
        </div>

        <!-- Paginated archive -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">
              Paginated archive
            </h3>
            <span class="text-sm text-muted">{{ pages.length }} page{{ pages.length === 1 ? '' : 's' }}</span>
          </div>

          <div v-if="isPaginationPending && !paginatedTasks.length" class="flex items-center gap-2 py-10 text-muted">
            <UIcon name="i-lucide-loader" class="size-5 animate-spin" />
            Loading archive...
          </div>

          <div v-else-if="paginatedTasks.length" class="space-y-2">
            <div
              v-for="task in paginatedTasks"
              :key="task._id"
              class="rounded-md border border-default bg-elevated/50 px-4 py-3"
            >
              <p class="font-medium text-highlighted">
                {{ task.title }}
              </p>
              <p class="text-xs text-dimmed">
                {{ new Date(task.createdAt).toLocaleString() }}
              </p>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <UButton v-if="!isDone" size="sm" :loading="isLoadingMore" @click="loadMore">
                Load more
              </UButton>
              <UBadge v-else color="success" variant="subtle">
                All loaded
              </UBadge>
              <span class="text-sm text-muted">{{ paginatedTasks.length }} rendered</span>
            </div>
          </div>

          <UEmpty v-else icon="i-lucide-list" title="Archive empty" description="Seed tasks to exercise pagination." class="py-10" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
