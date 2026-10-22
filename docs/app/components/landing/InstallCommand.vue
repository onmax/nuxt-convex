<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

export type Framework = 'nuxt' | 'vue'

const framework = defineModel<Framework>({ default: 'nuxt' })

const commands: Record<Framework, { pkg: string, label: string, icon: string }> = {
  nuxt: { pkg: 'nuxt-convex', label: 'Nuxt', icon: 'i-simple-icons-nuxt' },
  vue: { pkg: 'vue-convex', label: 'Vue', icon: 'i-simple-icons-vuedotjs' },
}

const command = computed(() => `pnpm add ${commands[framework.value].pkg} convex`)
const { copy, copied } = useClipboard({ copiedDuring: 1600 })
</script>

<template>
  <div class="flex w-full max-w-md items-center gap-1 rounded-xl bg-default p-1 shadow-[0_0_0_1px_var(--ui-border),0_1px_2px_oklch(0_0_0/0.04),0_8px_24px_-12px_oklch(0_0_0/0.12)] sm:w-auto">
    <div
      role="group"
      aria-label="Framework"
      class="flex shrink-0 rounded-lg bg-muted p-0.5"
    >
      <button
        v-for="(item, key) in commands"
        :key="key"
        type="button"
        :aria-pressed="framework === key"
        class="relative flex h-8 items-center gap-1.5 rounded-md px-2 sm:px-2.5 text-[13px] font-medium transition-[color,background-color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        :class="framework === key ? 'bg-default text-highlighted shadow-[0_0_0_1px_var(--ui-border),0_1px_2px_oklch(0_0_0/0.06)]' : 'text-muted hover:text-highlighted'"
        @click="framework = key"
      >
        <UIcon
          :name="item.icon"
          class="size-3.5"
          :class="framework === key ? (key === 'nuxt' ? 'text-[#00DC82]' : 'text-[#41B883]') : ''"
        />
        <span class="sr-only sm:not-sr-only">{{ item.label }}</span>
      </button>
    </div>

    <code class="min-w-0 flex-1 truncate px-1.5 font-mono text-[12px] text-highlighted sm:px-2.5 sm:text-[13px]">
      <span class="select-none text-dimmed">$ </span>{{ command }}
    </code>

    <UButton
      :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      color="neutral"
      variant="ghost"
      size="sm"
      class="shrink-0"
      :aria-label="copied ? 'Copied' : 'Copy install command'"
      @click="copy(command)"
    />
    <span class="sr-only" aria-live="polite">{{ copied ? 'Copied to clipboard' : '' }}</span>
  </div>
</template>
