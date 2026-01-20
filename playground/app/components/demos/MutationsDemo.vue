<script setup lang="ts">
import type { Doc, Id } from '../../../convex/_generated/dataModel'
import { api } from '#convex/api'

const toast = useToast()
const { user } = useUserSession()
const userId = computed(() => user.value?.id || '')

const newTaskTitle = ref('')

// Basic mutation
const { mutate: addTask, isLoading: isAdding, error: addError } = useConvexMutation(api.tasks.add, {
  onSuccess: () => {
    newTaskTitle.value = ''
    toast.add({ title: 'Task added', color: 'success' })
  },
  onError: (err) => {
    toast.add({ title: 'Failed to add task', description: err.message, color: 'error' })
  },
})

// Query for list
const { data: tasks } = await useConvexQuery(api.tasks.list, computed(() => ({ userId: userId.value })))

// Delete mutation
const { mutate: deleteTask, isLoading: isDeleting } = useConvexMutation(api.tasks.remove)

async function handleAdd() {
  if (!newTaskTitle.value.trim())
    return
  await addTask({ title: newTaskTitle.value, userId: userId.value })
}

async function handleDelete(id: Id<'tasks'>) {
  await deleteTask({ id })
}

// Mutation with optimistic update
const { mutate: addOptimistic, isLoading: isAddingOptimistic } = useConvexMutation(api.tasks.add, {
  optimisticUpdate: (localStore, args) => {
    const current = localStore.getQuery(api.tasks.list, { userId: args.userId })
    if (current) {
      const tempTask: Doc<'tasks'> = { _id: `temp-${Date.now()}` as Id<'tasks'>, _creationTime: Date.now(), title: args.title, userId: args.userId, createdAt: Date.now() }
      localStore.setQuery(api.tasks.list, { userId: args.userId }, [tempTask, ...current])
    }
  },
  onSuccess: () => {
    toast.add({ title: 'Task added (optimistic)', color: 'success' })
  },
})
</script>

<template>
  <div class="space-y-6">
    <!-- Basic Mutation -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-pencil-square" class="text-primary" />
          <span class="font-semibold">useConvexMutation (Basic)</span>
        </div>
      </template>

      <form class="flex gap-2 mb-4" @submit.prevent="handleAdd">
        <UInput v-model="newTaskTitle" placeholder="New task title..." class="flex-1" />
        <UButton type="submit" :loading="isAdding" :disabled="!newTaskTitle.trim()">
          Add Task
        </UButton>
      </form>

      <UAlert v-if="addError" color="error" :title="addError.message" class="mb-4" />

      <div class="space-y-2">
        <div v-for="task in tasks?.slice(0, 5)" :key="task._id" class="group flex items-center justify-between p-2 rounded bg-muted">
          <span class="text-sm">{{ task.title }}</span>
          <UButton icon="i-heroicons-trash" size="xs" color="error" variant="ghost" :loading="isDeleting" class="opacity-0 group-hover:opacity-100" @click="handleDelete(task._id)" />
        </div>
        <div v-if="tasks && tasks.length > 5" class="text-xs text-muted">
          ... and {{ tasks.length - 5 }} more
        </div>
        <UEmpty v-if="!tasks?.length" icon="i-heroicons-clipboard" title="No tasks" description="Add one above" class="py-4" />
      </div>
    </UCard>

    <!-- Loading/Error States -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-warning" />
          <span class="font-semibold">isLoading & error States</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-4">
        Mutations expose <code class="bg-muted px-1 rounded">isLoading</code> and <code class="bg-muted px-1 rounded">error</code> refs for UI feedback.
      </div>

      <div class="flex gap-4 text-sm">
        <div class="flex items-center gap-2">
          <span class="text-muted">isAdding:</span>
          <UBadge :color="isAdding ? 'warning' : 'neutral'" variant="subtle">
            {{ isAdding }}
          </UBadge>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">isDeleting:</span>
          <UBadge :color="isDeleting ? 'warning' : 'neutral'" variant="subtle">
            {{ isDeleting }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- Optimistic Updates -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-bolt" class="text-success" />
          <span class="font-semibold">Optimistic Updates</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-4">
        Update UI immediately before server confirms. If mutation fails, changes roll back automatically.
      </div>

      <UButton :loading="isAddingOptimistic" @click="addOptimistic({ title: `Optimistic task ${Date.now()}`, userId })">
        Add with Optimistic Update
      </UButton>
    </UCard>

    <!-- Return Values -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-arrow-uturn-left" class="text-info" />
          <span class="font-semibold">Return Value Handling</span>
        </div>
      </template>

      <div class="text-sm text-muted">
        <code class="bg-muted px-1 rounded">mutate()</code> returns a Promise with the mutation result. Use <code class="bg-muted px-1 rounded">onSuccess</code> callback or <code class="bg-muted px-1 rounded">await mutate()</code> to handle return values.
      </div>
    </UCard>
  </div>
</template>
