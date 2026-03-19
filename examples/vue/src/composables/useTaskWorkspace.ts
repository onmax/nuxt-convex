import { useConvexMutation, useConvexQuery } from '@onmax/convex-vue'
import { computed, shallowRef } from 'vue'
import { api } from '../lib/convex'
import type { TaskId } from '../lib/model'

export function useTaskWorkspace(userId: string) {
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

  async function submitTask() {
    const title = draftTitle.value.trim()
    if (!title)
      return

    await addTask({ title, userId })
    draftTitle.value = ''
  }

  async function deleteTaskById(id: TaskId) {
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
