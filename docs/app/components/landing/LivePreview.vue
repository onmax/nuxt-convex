<script setup lang="ts">
// A mock of the page in the code window: the list arrives server-rendered, then the client
// subscribes and new tasks stream in. Nothing here talks to Convex; it only shows the lifecycle.
interface Task { id: number, text: string, done: boolean }

const incoming = [
  'Review the pull request',
  'Add an index on userId',
  'Paginate the activity feed',
  'Upload the release notes',
  'Ship it',
]

const tasks = ref<Task[]>([
  { id: 3, text: 'Render the list on the server', done: true },
  { id: 2, text: 'Generate the typed API', done: true },
  { id: 1, text: 'Define the tasks table', done: true },
])
const phase = ref<'ssr' | 'live'>('ssr')
const updates = ref(0)

let timers: ReturnType<typeof setTimeout>[] = []
let interval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timers.push(setTimeout(() => {
    phase.value = 'live'
  }, 1400))

  let next = 0
  interval = setInterval(() => {
    const id = Date.now()
    tasks.value = [{ id, text: incoming[next % incoming.length]!, done: false }, ...tasks.value].slice(0, 4)
    updates.value++
    next++
    timers.push(setTimeout(() => {
      const task = tasks.value.find(t => t.id === id)
      if (task)
        task.done = true
    }, 2200))
  }, 3600)
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  timers = []
  clearInterval(interval)
})
</script>

<template>
  <div class="flex min-w-0 flex-col border-t border-white/[0.07] bg-white/[0.02] lg:border-l lg:border-t-0">
    <div class="flex h-10 items-center gap-2 border-b border-white/[0.07] px-4">
      <UIcon name="i-lucide-lock" class="size-3 text-zinc-500" aria-hidden="true" />
      <span class="font-mono text-[12px] text-zinc-400">localhost:3000</span>
      <span
        class="ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 transition-colors duration-300"
        :class="phase === 'live' ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25' : 'bg-white/5 text-zinc-300 ring-white/10'"
        aria-live="polite"
      >
        <span class="relative flex size-1.5" aria-hidden="true">
          <span v-if="phase === 'live'" class="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
          <span class="relative size-1.5 rounded-full" :class="phase === 'live' ? 'bg-emerald-400' : 'bg-zinc-400'" />
        </span>
        {{ phase === 'live' ? 'Live · WebSocket' : 'Server-rendered' }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex items-baseline justify-between">
        <p class="text-sm font-semibold text-zinc-100">
          Tasks
        </p>
        <p class="font-mono text-[11px] tabular-nums text-zinc-400">
          {{ updates }} {{ updates === 1 ? 'update' : 'updates' }} pushed
        </p>
      </div>

      <TransitionGroup
        tag="ul"
        class="relative flex flex-col gap-1.5"
        enter-active-class="transition-[opacity,transform] duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-1.5"
        leave-active-class="absolute inset-x-0 transition-opacity duration-200 ease-out"
        leave-to-class="opacity-0"
        move-class="transition-transform duration-300 ease-out"
      >
        <li
          v-for="task in tasks"
          :key="task.id"
          class="flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-3 py-2 ring-1 ring-white/[0.06]"
        >
          <span
            class="flex size-4 shrink-0 items-center justify-center rounded-[5px] ring-1 transition-colors duration-300"
            :class="task.done ? 'bg-convex-500 ring-convex-500' : 'ring-white/20'"
            aria-hidden="true"
          >
            <UIcon v-if="task.done" name="i-lucide-check" class="size-3 text-white" />
          </span>
          <span
            class="truncate text-[13px] transition-colors duration-300"
            :class="task.done ? 'text-zinc-400 line-through decoration-zinc-500' : 'text-zinc-200'"
          >
            {{ task.text }}
          </span>
        </li>
      </TransitionGroup>

      <dl class="mt-auto grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-white/[0.06] text-center ring-1 ring-white/[0.06]">
        <div class="bg-[oklch(0.17_0.004_286)] px-2 py-2">
          <dt class="text-[10px] uppercase tracking-[0.06em] text-zinc-400">
            SSR fetch
          </dt>
          <dd class="font-mono text-[12px] tabular-nums text-zinc-200">
            1
          </dd>
        </div>
        <div class="bg-[oklch(0.17_0.004_286)] px-2 py-2">
          <dt class="text-[10px] uppercase tracking-[0.06em] text-zinc-400">
            Refetch
          </dt>
          <dd class="font-mono text-[12px] tabular-nums text-zinc-200">
            0
          </dd>
        </div>
        <div class="bg-[oklch(0.17_0.004_286)] px-2 py-2">
          <dt class="text-[10px] uppercase tracking-[0.06em] text-zinc-400">
            Socket
          </dt>
          <dd class="font-mono text-[12px] tabular-nums" :class="phase === 'live' ? 'text-emerald-300' : 'text-zinc-400'">
            {{ phase === 'live' ? 'open' : '—' }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
