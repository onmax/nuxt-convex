<script setup lang="ts">
import { useIntervalFn, useTimeoutFn } from '@vueuse/core'

interface Task { id: number, text: string, completed: boolean }

const tasks = ref<Task[]>([
  { id: 1, text: 'Set up Convex backend', completed: true },
  { id: 2, text: 'Add realtime queries', completed: true },
  { id: 3, text: 'Deploy to production', completed: false },
])

onMounted(() => {
  useTimeoutFn(() => {
    tasks.value.push({ id: 4, text: 'Ship it 🚀', completed: false })
  }, 2000)

  useIntervalFn(() => {
    const task = tasks.value.find(t => t.id === 3)
    if (task)
      task.completed = !task.completed
  }, 3000)
})
</script>

<template>
  <div class="mx-auto flex max-w-5xl flex-col items-stretch gap-6 lg:flex-row">
    <div class="min-w-0 flex-1 overflow-x-auto rounded-xl bg-zinc-900 p-5 font-mono text-sm leading-relaxed text-zinc-300">
      <div class="mb-3 flex items-center gap-2 text-xs text-zinc-500">
        <span class="size-2 rounded-full bg-convex-500 realtime-preview-pulse" />
        convex/schema.ts
      </div>
      <div><span class="text-violet-400">export default</span> defineSchema({</div>
      <div class="pl-4">
        tasks: defineTable({
      </div>
      <div class="pl-8">
        text: v.string(),
      </div>
      <div class="pl-8">
        completed: v.boolean(),
      </div>
      <div class="pl-4">
        }),
      </div>
      <div>})</div>

      <div class="mb-3 mt-5 flex items-center gap-2 text-xs text-zinc-500">
        <span class="size-2 rounded-full bg-emerald-500 realtime-preview-pulse" />
        TaskList.vue
      </div>
      <div><span class="text-violet-400">const</span> { data: tasks } = <span class="text-amber-200">useConvexQuery</span>(</div>
      <div class="pl-4">
        api.tasks.list, {}
      </div>
      <div>)</div>
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 font-mono text-sm text-muted">
          <span class="size-2 rounded-full bg-convex-500 realtime-preview-pulse" />
          Live preview
        </div>
        <UBadge color="primary" variant="subtle" size="sm">
          Realtime
        </UBadge>
      </div>

      <div class="flex-1 space-y-2 rounded-xl border border-default bg-elevated p-4">
        <TransitionGroup name="task-list">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300"
            :class="task.id === 4 ? 'realtime-preview-item-enter bg-convex-50 dark:bg-convex-950/30' : 'bg-zinc-50 dark:bg-zinc-800/50'"
          >
            <div
              class="size-4 shrink-0 rounded border-2 transition-colors duration-300 flex items-center justify-center"
              :class="task.completed ? 'bg-convex-500 border-convex-500' : 'border-zinc-300 dark:border-zinc-600'"
            >
              <span v-if="task.completed" class="text-xs text-white">✓</span>
            </div>
            <span
              class="text-sm transition-all duration-300"
              :class="task.completed ? 'line-through text-muted' : 'text-highlighted'"
            >
              {{ task.text }}
            </span>
          </div>
        </TransitionGroup>
      </div>

      <p class="text-center text-xs text-muted">
        Schema <UIcon name="i-lucide-arrow-right" class="inline size-3" /> composable <UIcon name="i-lucide-arrow-right" class="inline size-3" /> reactive UI. Fully typed.
      </p>
    </div>
  </div>
</template>
