<script setup lang="ts">
interface Track {
  id: 'nuxt' | 'vue'
  package: string
  title: string
  description: string
  points: string[]
  snippet: string
  to: string
  cta: string
}

defineProps<{
  eyebrow?: string
  title: string
  description?: string
  tracks: Track[]
}>()

const brand = {
  nuxt: { icon: 'i-simple-icons-nuxt', color: 'text-[#00C16A] dark:text-[#00DC82]', glow: 'oklch(0.78 0.19 158 / 0.14)' },
  vue: { icon: 'i-simple-icons-vuedotjs', color: 'text-[#35A06F] dark:text-[#41B883]', glow: 'oklch(0.72 0.13 163 / 0.14)' },
}
</script>

<template>
  <section class="border-y border-default bg-muted/50 py-20 sm:py-28">
    <UContainer>
      <LandingSectionHeading :eyebrow :title :description />

      <div class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        <NuxtLink
          v-for="track in tracks"
          :key="track.id"
          :to="track.to"
          class="group relative flex flex-col overflow-hidden rounded-2xl bg-default p-6 shadow-[0_0_0_1px_var(--ui-border),0_1px_2px_oklch(0_0_0/0.04)] transition-shadow duration-200 hover:shadow-[0_0_0_1px_var(--ui-border-accented),0_12px_32px_-16px_oklch(0_0_0/0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-8"
        >
          <div
            class="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            :style="{ background: `radial-gradient(closest-side, ${brand[track.id].glow}, transparent)` }"
            aria-hidden="true"
          />

          <div class="flex items-center gap-3">
            <div class="flex size-11 items-center justify-center rounded-xl bg-muted shadow-[inset_0_0_0_1px_var(--ui-border)]">
              <UIcon :name="brand[track.id].icon" class="size-6" :class="brand[track.id].color" aria-hidden="true" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-highlighted">
                {{ track.title }}
              </h3>
              <p class="font-mono text-[13px] text-muted">
                {{ track.package }}
              </p>
            </div>
          </div>

          <p class="mt-5 text-[15px]/6 text-muted">
            <LandingInlineCode :text="track.description" />
          </p>

          <ul class="mt-5 grid gap-2.5 text-[14px]/5 text-toned">
            <li v-for="point in track.points" :key="point" class="flex gap-2.5">
              <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span><LandingInlineCode :text="point" /></span>
            </li>
          </ul>

          <pre class="mt-6 overflow-x-auto rounded-xl bg-muted px-4 py-3 font-mono text-[12.5px]/6 text-toned shadow-[inset_0_0_0_1px_var(--ui-border)]"><code>{{ track.snippet }}</code></pre>

          <span class="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {{ track.cta }}
            <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </NuxtLink>
      </div>
    </UContainer>
  </section>
</template>
