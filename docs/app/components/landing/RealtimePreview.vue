<script setup lang="ts">
import { useIntervalFn, useTimeoutFn } from '@vueuse/core'

interface Task { id: number, text: string, completed: boolean }

const tasks = ref<Task[]>([
  { id: 1, text: 'Set up Convex backend', completed: true },
  { id: 2, text: 'Add realtime queries', completed: true },
  { id: 3, text: 'Deploy to production', completed: false },
])

useTimeoutFn(() => {
  tasks.value.push({ id: 4, text: 'Ship it 🚀', completed: false })
}, 2000)

useIntervalFn(() => {
  const task = tasks.value.find(t => t.id === 3)
  if (task)
    task.completed = !task.completed
}, 3000)
</script>

<template>
  <div class="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-stretch">
    <!-- Code panel -->
    <div class="flex-1 min-w-0 rounded-xl bg-zinc-900 p-5 text-sm font-mono text-zinc-300 leading-relaxed overflow-x-auto">
      <div class="flex items-center gap-2 text-xs text-zinc-500 mb-3">
        <span class="size-2 rounded-full bg-convex-500 realtime-preview-pulse" />
        convex/schema.ts
      </div>
      <div><span class="text-violet-400">export default</span> defineSchema({</div>
      <div class="pl-4">tasks: defineTable({</div>
      <div class="pl-8">text: v.string(),</div>
      <div class="pl-8">completed: v.boolean(),</div>
      <div class="pl-4">}),</div>
      <div>})</div>

      <div class="flex items-center gap-2 text-xs text-zinc-500 mt-5 mb-3">
        <span class="size-2 rounded-full bg-emerald-500 realtime-preview-pulse" />
        TaskList.vue
      </div>
      <div><span class="text-violet-400">const</span> { data: tasks } = <span class="text-amber-200">useConvexQuery</span>(</div>
      <div class="pl-4">api.tasks.list, {}</div>
      <div>)</div>
    </div>

    <!-- Live preview panel -->
    <div class="flex-1 min-w-0 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-muted font-mono">
          <span class="size-2 rounded-full bg-convex-500 realtime-preview-pulse" />
          Live preview
        </div>
        <UBadge color="primary" variant="subtle" size="xs">
          Realtime
        </UBadge>
      </div>

      <div class="flex-1 rounded-xl border border-default bg-elevated p-4 space-y-2">
        <TransitionGroup name="task-list">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300"
            :class="task.id === 4 ? 'realtime-preview-item-enter bg-convex-50 dark:bg-convex-950/30' : 'bg-zinc-50 dark:bg-zinc-800/50'"
          >
            <div
              class="size-4 rounded border-2 flex items-center justify-center transition-colors duration-300 shrink-0"
              :class="task.completed ? 'bg-convex-500 border-convex-500' : 'border-zinc-300 dark:border-zinc-600'"
            >
              <span v-if="task.completed" class="text-white text-xs">✓</span>
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

      <p class="text-xs text-muted text-center">
        Schema → composable → reactive UI. Fully typed.
      </p>
    </div>
  </div>
</template>
