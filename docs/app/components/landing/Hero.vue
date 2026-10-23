<script setup lang="ts">
import type { VNode, VNodeArrayChildren } from 'vue'
import type { CodeWindowFile } from './CodeWindow.vue'
import type { Framework } from './InstallCommand.vue'
import { Fragment, isVNode } from 'vue'

interface HeroLink {
  label: string
  to: string
  icon?: string
  trailingIcon?: string
  target?: string
}

const props = defineProps<{
  title: string
  /** Part of the title drawn with the brand gradient. */
  highlight?: string
  description: string
  badge?: { label: string, to: string }
  links?: HeroLink[]
}>()

// Each slot holds one fenced code block from index.md: the Convex function, the Nuxt page and the Vue component.
const slots = defineSlots<{
  backend?: () => VNode[]
  nuxt?: () => VNode[]
  vue?: () => VNode[]
}>()

const framework = ref<Framework>('nuxt')

function firstPre(nodes?: VNodeArrayChildren): VNode | undefined {
  for (const node of nodes ?? []) {
    if (!isVNode(node))
      continue
    if (node.type === Fragment && Array.isArray(node.children)) {
      const found = firstPre(node.children)
      if (found)
        return found
    }
    else if (node.props && 'filename' in node.props) {
      return node
    }
  }
}

function file(nodes?: VNode[]): CodeWindowFile | undefined {
  const node = firstPre(nodes)
  return node ? { name: String(node.props!.filename), node } : undefined
}

const files = computed(() => [
  file(slots.backend?.()),
  file(framework.value === 'nuxt' ? slots.nuxt?.() : slots.vue?.()),
].filter((f): f is CodeWindowFile => !!f))

const hovers = {
  'app/pages/index.vue': { line: 5, column: 14, label: 'tasks', type: 'Readonly<Ref<Doc<\'tasks\'>[] | undefined>>' },
  'src/App.vue': { line: 6, column: 14, label: 'tasks', type: 'Readonly<Ref<Doc<\'tasks\'>[] | undefined>>' },
}

const titleParts = computed(() => {
  const at = props.highlight ? props.title.indexOf(props.highlight) : -1
  if (at < 0)
    return { before: props.title, match: '', after: '' }
  return {
    before: props.title.slice(0, at),
    // A non-breaking hyphen keeps "server-rendered" on one line.
    match: props.highlight!.replaceAll('-', '\u2011'),
    after: props.title.slice(at + props.highlight!.length),
  }
})
</script>

<template>
  <section class="relative isolate overflow-hidden">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] text-zinc-900 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_30%,transparent_75%)] dark:text-zinc-100"
      aria-hidden="true"
    >
      <EffectsFlickeringGrid :square-size="3" :grid-gap="9" :max-opacity="0.14" :flicker-chance="0.15" />
    </div>
    <div
      class="pointer-events-none absolute left-1/2 top-[-18rem] -z-10 h-[40rem] w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--landing-glow),transparent)]"
      aria-hidden="true"
    />

    <UContainer class="flex flex-col items-center pb-20 pt-16 sm:pb-28 sm:pt-24">
      <NuxtLink
        v-if="badge"
        :to="badge.to"
        class="group mb-7 inline-flex items-center gap-2 rounded-full bg-default/80 py-1 pl-1 pr-3 text-[13px] text-toned shadow-[0_0_0_1px_var(--ui-border)] backdrop-blur transition-[box-shadow,color] duration-150 hover:text-highlighted hover:shadow-[0_0_0_1px_var(--ui-border-accented)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span class="rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-medium text-primary">New</span>
        {{ badge.label }}
        <UIcon name="i-lucide-arrow-right" class="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
      </NuxtLink>

      <h1 class="max-w-4xl text-center text-[2.5rem]/[1.08] font-semibold tracking-[-0.03em] text-highlighted sm:text-6xl/[1.05] lg:text-[4.25rem]/[1.04]">
        {{ titleParts.before }}<span v-if="titleParts.match" class="text-gradient-brand">{{ titleParts.match }}</span>{{ titleParts.after }}
      </h1>

      <p class="mt-6 max-w-2xl text-center text-lg/8 text-muted sm:text-xl/8">
        {{ description }}
      </p>

      <div class="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
        <LandingInstallCommand v-model="framework" />
        <div class="flex w-full gap-3 sm:w-auto">
          <UButton
            v-for="(link, index) in links"
            :key="link.to"
            v-bind="link"
            size="lg"
            :color="index === 0 ? 'primary' : 'neutral'"
            :variant="index === 0 ? 'solid' : 'outline'"
            class="h-11 flex-1 justify-center px-4 active:scale-[0.96] transition-transform sm:flex-none"
          />
        </div>
      </div>

      <div class="relative mt-16 w-full max-w-5xl sm:mt-20">
        <LandingCodeWindow :files :default-index="1" :hovers>
          <template #aside>
            <LandingLivePreview />
          </template>
        </LandingCodeWindow>
      </div>
    </UContainer>
  </section>
</template>
