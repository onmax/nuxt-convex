import type { ComputedRef, Ref, ShallowRef } from 'vue'
import type { QueryStatus } from 'vue-convex'
import type { TaskDoc, TaskId } from '../lib/model'
import { computed, shallowRef } from 'vue'
import { isConvexError, useConvexMutation, useConvexQuery } from 'vue-convex'
import { api } from '../lib/convex'

interface UseTaskWorkspaceReturn {
  draftTitle: ShallowRef<string>
  busyId: ShallowRef<TaskId | null>
  /** A message for the user, from a ConvexError when there is one */
  errorMessage: ComputedRef<string | null>
  isAdding: ComputedRef<boolean>
  status: Readonly<Ref<QueryStatus>>
  tasks: ComputedRef<TaskDoc[]>
  remaining: ComputedRef<number>
  submitTask: () => Promise<void>
  toggleTask: (id: TaskId) => Promise<void>
  removeTask: (id: TaskId) => Promise<void>
}

/** Errors thrown with `new ConvexError({ code, message })` in convex/tasks.ts carry a message for the UI */
function toMessage(error: Error | null): string | null {
  if (!error)
    return null
  if (isConvexError(error) && typeof error.data === 'object' && error.data !== null && 'message' in error.data)
    return String(error.data.message)
  return 'Something went wrong. Check the console for details.'
}

export function useTaskWorkspace(): UseTaskWorkspaceReturn {
  const draftTitle = shallowRef('')
  const busyId = shallowRef<TaskId | null>(null)

  // `list` takes no arguments, so none are passed
  const { data, error: queryError, status } = useConvexQuery(api.tasks.list)
  const add = useConvexMutation(api.tasks.add)
  const toggle = useConvexMutation(api.tasks.toggle)
  const remove = useConvexMutation(api.tasks.remove)

  const tasks = computed(() => data.value ?? [])
  const remaining = computed(() => tasks.value.filter(task => !task.isCompleted).length)
  const errorMessage = computed(() => toMessage(add.error.value ?? toggle.error.value ?? remove.error.value ?? queryError.value))

  async function submitTask(): Promise<void> {
    try {
      await add.mutate({ title: draftTitle.value })
      draftTitle.value = ''
    }
    catch (error) {
      // EMPTY_TITLE and TITLE_TOO_LONG are shown through `errorMessage`; anything else is a bug
      if (!isConvexError(error))
        console.error(error)
    }
  }

  async function runOnTask(id: TaskId, run: () => Promise<unknown>): Promise<void> {
    busyId.value = id
    try {
      await run()
    }
    catch (error) {
      if (!isConvexError(error, 'NOT_FOUND'))
        console.error(error)
    }
    finally {
      busyId.value = null
    }
  }

  return {
    draftTitle,
    busyId,
    errorMessage,
    isAdding: add.isPending,
    status,
    tasks,
    remaining,
    submitTask,
    toggleTask: id => runOnTask(id, () => toggle.mutate({ id })),
    removeTask: id => runOnTask(id, () => remove.mutate({ id })),
  }
}
