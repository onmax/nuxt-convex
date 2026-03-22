<script setup lang="ts">
import type { Id } from '../../../convex/_generated/dataModel'
import { api } from '#convex/api'

interface TaskFormState {
  title: string
  seedCount: number
}

const toast = useToast()
const { user } = useUserSession()
const userId = computed(() => user.value?.id ?? '')
const taskArgs = computed(() => userId.value ? { userId: userId.value } : 'skip' as const)
const form = reactive<TaskFormState>({
  title: '',
  seedCount: 18,
})

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
const isWorking = computed(() =>
  isCreating.value
  || isRemoving.value
  || isSeeding.value
  || isClearing.value,
)

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Please try again.'
}

async function createTask(): Promise<void> {
  const title = form.title.trim()
  if (!title || !userId.value)
    return

  try {
    await addTask({ title, userId: userId.value })
    form.title = ''
    reset()
    toast.add({
      color: 'success',
      title: 'Task created',
      description: 'The live list and paginated archive updated together.',
    })
  }
  catch (error) {
    toast.add({
      color: 'error',
      title: 'Task creation failed',
      description: getErrorMessage(error),
    })
  }
}

async function removeTaskById(id: Id<'tasks'>): Promise<void> {
  try {
    await removeTask({ id })
    reset()
  }
  catch (error) {
    toast.add({
      color: 'error',
      title: 'Task deletion failed',
      description: getErrorMessage(error),
    })
  }
}

async function seedSampleTasks(): Promise<void> {
  if (!userId.value)
    return

  const count = Math.min(Math.max(Math.round(form.seedCount), 1), 50)

  try {
    const created = await seedTasks({ userId: userId.value, count })
    form.seedCount = count
    reset()
    toast.add({
      color: 'success',
      title: 'Sample tasks created',
      description: `${created} tasks are now available in both task views.`,
    })
  }
  catch (error) {
    toast.add({
      color: 'error',
      title: 'Task seeding failed',
      description: getErrorMessage(error),
    })
  }
}

async function clearTasks(): Promise<void> {
  if (!userId.value)
    return

  try {
    const removed = await clearAllTasks({ userId: userId.value })
    reset()
    toast.add({
      color: 'success',
      title: 'Task workspace cleared',
      description: `Removed ${removed} task${removed === 1 ? '' : 's'}.`,
    })
  }
  catch (error) {
    toast.add({
      color: 'error',
      title: 'Task cleanup failed',
      description: getErrorMessage(error),
    })
  }
}
</script>

<template>
  <div class="space-y-6">
    <UCard class="border-default/70 shadow-sm">
      <template #header>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="space-y-2">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-primary">
              Tasks
            </p>
            <h2 class="text-2xl font-semibold text-highlighted">
              Queries, mutations, and pagination.
            </h2>
            <p class="max-w-2xl text-sm text-muted">
              Create tasks, delete them, seed sample data, and page through the archive.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-default/60 bg-default/80 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.18em] text-dimmed">
                Live count
              </p>
              <p class="mt-2 text-2xl font-semibold text-highlighted">
                {{ totalTasks }}
              </p>
            </div>
            <div class="rounded-2xl border border-default/60 bg-default/80 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.18em] text-dimmed">
                Archive pages
              </p>
              <p class="mt-2 text-2xl font-semibold text-highlighted">
                {{ pages.length }}
              </p>
            </div>
            <div class="rounded-2xl border border-default/60 bg-default/80 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.18em] text-dimmed">
                Pending work
              </p>
              <p class="mt-2 text-2xl font-semibold text-highlighted">
                {{ isWorking ? 'Yes' : 'No' }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <div class="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <form class="space-y-4" @submit.prevent="createTask">
          <UFormField label="Task title" help="This mutation feeds both the live query and the paginated archive." required>
            <UInput v-model="form.title" size="xl" placeholder="Buy groceries" />
          </UFormField>

          <div class="flex flex-wrap gap-3">
            <UButton type="submit" size="lg" :loading="isCreating" :disabled="!form.title.trim()">
              Create task
            </UButton>
            <UButton type="button" size="lg" color="neutral" variant="outline" :loading="isClearing" :disabled="!hasTasks" @click="clearTasks">
              Clear all tasks
            </UButton>
          </div>
        </form>

        <div class="space-y-4 rounded-3xl border border-dashed border-default/70 bg-default/60 p-5">
          <div class="space-y-2">
            <h3 class="font-semibold text-highlighted">
              Seed and reset the archive
            </h3>
            <p class="text-sm text-muted">
              Bulk-add tasks to test pagination, then reset the view.
            </p>
          </div>

          <UFormField label="Seed count" help="The playground caps seeding at 50 tasks per request.">
            <UInput v-model.number="form.seedCount" type="number" :min="1" :max="50" :step="1" />
          </UFormField>

          <div class="flex flex-wrap gap-3">
            <UButton size="lg" color="neutral" variant="soft" :loading="isSeeding" @click="seedSampleTasks">
              Seed sample tasks
            </UButton>
            <UButton size="lg" color="neutral" variant="ghost" @click="reset">
              Reset pagination view
            </UButton>
          </div>
        </div>
      </div>
    </UCard>

    <div class="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <UCard class="border-default/70 shadow-sm">
        <template #header>
          <div class="flex items-center justify-between gap-4">
            <div>
              <h3 class="font-semibold text-highlighted">
                Live task feed
              </h3>
              <p class="text-sm text-muted">
                `useConvexQuery(api.tasks.list)` keeps this view in sync as mutations complete.
              </p>
            </div>
            <UBadge color="neutral" variant="subtle">
              {{ totalTasks }} total
            </UBadge>
          </div>
        </template>

        <div v-if="isPending && !hasTasks" class="flex items-center gap-2 py-10 text-muted">
          <UIcon name="i-heroicons-arrow-path" class="size-5 animate-spin" />
          Loading the current task list...
        </div>

        <div v-else-if="hasTasks" class="space-y-3">
          <div
            v-for="task in headlineTasks"
            :key="task._id"
            class="flex items-center justify-between gap-3 rounded-2xl border border-default/60 bg-default/70 px-4 py-3"
          >
            <div>
              <p class="font-medium text-highlighted">
                {{ task.title }}
              </p>
              <p class="text-xs text-dimmed">
                {{ new Date(task.createdAt).toLocaleString() }}
              </p>
            </div>
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-heroicons-trash"
              :loading="isRemoving"
              @click="removeTaskById(task._id)"
            />
          </div>

          <p v-if="remainingTasks" class="text-sm text-muted">
            {{ remainingTasks }} additional task{{ remainingTasks === 1 ? '' : 's' }} are available in the paginated archive.
          </p>
        </div>

        <UEmpty
          v-else
          icon="i-heroicons-clipboard-document-list"
          title="No tasks yet"
          description="Create your first task or seed sample data to exercise the full workflow."
          class="py-10"
        />
      </UCard>

      <UCard class="border-default/70 shadow-sm">
        <template #header>
          <div class="flex items-center justify-between gap-4">
            <div>
              <h3 class="font-semibold text-highlighted">
                Paginated archive
              </h3>
              <p class="text-sm text-muted">
                `useConvexPaginatedQuery(api.tasks.listPaginated)` with load-more.
              </p>
            </div>
            <UBadge color="neutral" variant="subtle">
              {{ pages.length }} page{{ pages.length === 1 ? '' : 's' }}
            </UBadge>
          </div>
        </template>

        <div v-if="isPaginationPending && !paginatedTasks.length" class="flex items-center gap-2 py-10 text-muted">
          <UIcon name="i-heroicons-arrow-path" class="size-5 animate-spin" />
          Loading the first archive page...
        </div>

        <div v-else-if="paginatedTasks.length" class="space-y-4">
          <div class="space-y-2">
            <div
              v-for="task in paginatedTasks"
              :key="task._id"
              class="rounded-2xl border border-default/60 bg-default/70 px-4 py-3"
            >
              <p class="font-medium text-highlighted">
                {{ task.title }}
              </p>
              <p class="text-xs text-dimmed">
                {{ new Date(task.createdAt).toLocaleString() }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 border-t border-default/70 pt-4">
            <UButton v-if="!isDone" size="sm" :loading="isLoadingMore" @click="loadMore">
              Load more tasks
            </UButton>
            <UBadge v-else color="success" variant="subtle">
              All tasks loaded
            </UBadge>
            <span class="text-sm text-muted">
              {{ paginatedTasks.length }} rendered across {{ pages.length }} page{{ pages.length === 1 ? '' : 's' }}.
            </span>
          </div>
        </div>

        <UEmpty
          v-else
          icon="i-heroicons-list-bullet"
          title="The archive is empty"
          description="Seed tasks or create one above to exercise the paginated flow."
          class="py-10"
        />
      </UCard>
    </div>
  </div>
</template>
