import type { ComputedRef, ShallowRef } from 'vue'
import type { TaskDoc, TaskId } from '../lib/model'
import { useConvexMutation, useConvexQuery } from '@onmax/convex-vue'
import { computed, shallowRef } from 'vue'
import { api } from '../lib/convex'

interface UseTaskWorkspaceReturn {
  deletingId: ShallowRef<TaskId | null>
  deleteTaskById: (id: TaskId) => Promise<void>
  draftTitle: ShallowRef<string>
  error: ComputedRef<Error | null>
  isAdding: ComputedRef<boolean>
  isPending: ComputedRef<boolean>
  submitTask: () => Promise<void>
  tasks: ComputedRef<TaskDoc[]>
}

export function useTaskWorkspace(userId: string): UseTaskWorkspaceReturn {
  const draftTitle = shallowRef('')
  const deletingId = shallowRef<TaskId | null>(null)
  const { data, error: queryError, isPending } = useConvexQuery(
    api.tasks.list,
    computed(() => ({ userId })),
    { server: false },
  )
  const { mutate: addTask, error: addError, isPending: isAdding } = useConvexMutation(api.tasks.add)
  const { mutate: removeTask, error: removeError } = useConvexMutation(api.tasks.remove)

  const tasks = computed(() => data.value ?? [])
  const error = computed(() => addError.value ?? removeError.value ?? queryError.value)

  async function submitTask(): Promise<void> {
    const title = draftTitle.value.trim()
    if (!title)
      return

    await addTask({ title, userId })
    draftTitle.value = ''
  }

  async function deleteTaskById(id: TaskId): Promise<void> {
    deletingId.value = id
    try {
      await removeTask({ id })
    }
    finally {
      deletingId.value = null
    }
  }

  return {
    deletingId,
    draftTitle,
    error,
    isAdding,
    isPending,
    submitTask,
    tasks,
    deleteTaskById,
  }
}
