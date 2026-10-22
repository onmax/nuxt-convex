<script setup lang="ts">
import type { VNode } from 'vue'

// An always-dark editor window. Each file is a highlighted `pre` rendered by the content pipeline
// (Shiki runs at build time); the window only adds the chrome and the tabs.
export interface CodeWindowFile {
  name: string
  node: VNode
}

export interface CodeWindowHover {
  /** 1-based line the hover card sits under. */
  line: number
  /** 0-based column, in characters, where the card starts. */
  column: number
  label: string
  type: string
}

const props = defineProps<{
  files: CodeWindowFile[]
  defaultIndex?: number
  /** A decorative IDE-style type hover, keyed by file name. */
  hovers?: Record<string, CodeWindowHover>
}>()

// Tabs are tracked by position, so switching the framework keeps the same tab open.
const active = ref(props.defaultIndex ?? 0)
const activeName = computed(() => props.files[active.value]?.name)
const hover = computed(() => activeName.value ? props.hovers?.[activeName.value] : undefined)

const id = useId()

function fileIcon(name: string) {
  if (name.endsWith('.vue'))
    return 'i-vscode-icons-file-type-vue'
  if (name.endsWith('.ts'))
    return 'i-vscode-icons-file-type-typescript'
  return 'i-vscode-icons-default-file'
}

function onKeydown(event: KeyboardEvent, index: number) {
  const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
  if (!delta)
    return
  event.preventDefault()
  active.value = (index + delta + props.files.length) % props.files.length
  nextTick(() => document.getElementById(`${id}-tab-${active.value}`)?.focus())
}
</script>

<template>
  <div class="code-window relative overflow-hidden rounded-2xl bg-[oklch(0.17_0.004_286)] text-left text-zinc-300 shadow-[0_0_0_1px_oklch(1_0_0/0.08),0_24px_64px_-16px_oklch(0_0_0/0.45),0_8px_24px_-12px_oklch(0_0_0/0.3)] dark:shadow-[0_0_0_1px_oklch(1_0_0/0.1),0_24px_80px_-24px_oklch(0.675_0.185_40/0.25)]">
    <EffectsBorderBeam :size="260" :duration="14" />

    <div class="flex h-11 items-center gap-4 border-b border-white/[0.07] pl-2 pr-2 sm:pl-4">
      <div class="hidden shrink-0 gap-1.5 sm:flex" aria-hidden="true">
        <span class="size-3 rounded-full bg-white/[0.12]" />
        <span class="size-3 rounded-full bg-white/[0.12]" />
        <span class="size-3 rounded-full bg-white/[0.12]" />
      </div>

      <div
        role="tablist"
        aria-label="Example files"
        class="-mb-px flex min-w-0 self-stretch overflow-x-auto [scrollbar-width:none]"
      >
        <button
          v-for="(file, index) in files"
          :id="`${id}-tab-${index}`"
          :key="file.name"
          type="button"
          role="tab"
          :aria-selected="active === index"
          :aria-controls="`${id}-panel`"
          :tabindex="active === index ? 0 : -1"
          class="relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 font-mono text-[12px] transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-convex-400"
          :class="active === index ? 'text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'"
          @click="active = index"
          @keydown="onKeydown($event, index)"
        >
          <UIcon :name="fileIcon(file.name)" class="size-3.5" />
          {{ file.name }}
          <span
            v-if="active === index"
            class="absolute inset-x-2 bottom-0 h-px bg-linear-to-r from-brand-red to-brand-amber"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <div class="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]">
      <div
        :id="`${id}-panel`"
        role="tabpanel"
        :aria-labelledby="`${id}-tab-${active}`"
        class="relative min-w-0"
      >
        <div
          v-for="(file, index) in files"
          v-show="active === index"
          :key="file.name"
        >
          <component
            :is="file.node"
            hide-header
            :copy="false"
            :ui="{
              root: 'my-0 bg-transparent',
              base: 'm-0 rounded-none border-0 bg-transparent px-5 py-5 text-[12px]/[1.7] sm:text-[13px]/[1.7] font-mono overflow-x-auto whitespace-pre break-normal sm:min-h-[22rem]',
            }"
          />
        </div>

        <div
          v-if="hover"
          class="pointer-events-none absolute z-10 hidden max-w-[calc(100%-2.5rem)] rounded-lg bg-[oklch(0.24_0.006_286)] px-3 py-2 font-mono text-[12px]/5 text-zinc-300 shadow-[0_0_0_1px_oklch(1_0_0/0.1),0_12px_32px_-8px_oklch(0_0_0/0.6)] lg:block"
          :style="{ top: `calc(1.25rem + ${hover.line} * 13px * 1.7 + 2px)`, left: `calc(1.25rem + ${hover.column} * 13px * 0.6)` }"
          aria-hidden="true"
        >
          <span class="text-[#F97583]">const</span> <span class="text-[#79B8FF]">{{ hover.label }}</span><span class="text-zinc-400">:</span> <span class="text-[#B392F0]">{{ hover.type }}</span>
        </div>
      </div>

      <slot name="aside" />
    </div>
  </div>
</template>
