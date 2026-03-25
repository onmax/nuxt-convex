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
  <div class="max-w-4xl mx-auto grid lg:grid-cols-2 gap-6 items-start">
    <!-- Code side -->
    <div class="space-y-3">
      <div class="flex items-center gap-2 text-sm text-muted font-mono">
        <span class="size-2 rounded-full bg-convex-500 realtime-preview-pulse" />
        <span>convex/schema.ts</span>
      </div>
      <div class="rounded-xl bg-zinc-900 p-4 text-sm font-mono text-zinc-300 leading-relaxed overflow-x-auto">
        <div><span class="text-violet-400">import</span> { defineSchema, defineTable } <span class="text-violet-400">from</span> <span class="text-amber-300">"convex/server"</span></div>
        <div><span class="text-violet-400">import</span> { v } <span class="text-violet-400">from</span> <span class="text-amber-300">"convex/values"</span></div>
        <div class="mt-2">
          <span class="text-violet-400">export default</span> defineSchema({
        </div>
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
      </div>

      <div class="flex items-center gap-2 text-sm text-muted font-mono mt-4">
        <span class="size-2 rounded-full bg-emerald-500 realtime-preview-pulse" />
        <span>TaskList.vue</span>
      </div>
      <div class="rounded-xl bg-zinc-900 p-4 text-sm font-mono text-zinc-300 leading-relaxed overflow-x-auto">
        <div><span class="text-zinc-500">&lt;script setup&gt;</span></div>
        <div><span class="text-violet-400">const</span> { data: tasks } = <span class="text-amber-200">useConvexQuery</span>(</div>
        <div class="pl-4">api.tasks.list, {}</div>
        <div>)</div>
        <div><span class="text-zinc-500">&lt;/script&gt;</span></div>
      </div>
    </div>

    <!-- Live preview side -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-muted font-mono">
          <span class="size-2 rounded-full bg-convex-500 realtime-preview-pulse" />
          <span>Live preview</span>
        </div>
        <UBadge color="primary" variant="subtle" size="xs">
          Realtime
        </UBadge>
      </div>

      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-2">
        <TransitionGroup name="task-list">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300"
            :class="[
              task.id === 4 ? 'realtime-preview-item-enter bg-convex-50 dark:bg-convex-950/30' : 'bg-zinc-50 dark:bg-zinc-800/50',
            ]"
          >
            <div
              class="size-4 rounded border-2 flex items-center justify-center transition-colors duration-300 shrink-0"
              :class="task.completed ? 'bg-convex-500 border-convex-500' : 'border-zinc-300 dark:border-zinc-600'"
            >
              <span v-if="task.completed" class="text-white text-xs">✓</span>
            </div>
            <span
              class="text-sm transition-all duration-300"
              :class="task.completed ? 'line-through text-muted' : 'text-zinc-900 dark:text-zinc-100'"
            >
              {{ task.text }}
            </span>
          </div>
        </TransitionGroup>
      </div>

      <p class="text-xs text-muted text-center">
        Schema changes propagate to your components — fully typed, fully reactive.
      </p>
    </div>
  </div>
</template>
