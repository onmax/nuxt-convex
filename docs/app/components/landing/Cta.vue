<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  links?: { label: string, to: string, icon?: string, trailingIcon?: string, target?: string }[]
}>()
</script>

<template>
  <section class="pb-24 pt-4 sm:pb-32">
    <UContainer>
      <div class="relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[oklch(0.17_0.004_286)] px-6 py-16 text-center shadow-[0_0_0_1px_oklch(1_0_0/0.08)] sm:px-16 sm:py-20">
        <div
          class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_120%,oklch(0.675_0.185_40/0.35),transparent_70%)]"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,oklch(1_0_0/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0/0.05)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          aria-hidden="true"
        />
        <h2 class="text-3xl/[1.15] font-semibold tracking-[-0.02em] text-white sm:text-4xl/[1.12]">
          {{ title }}
        </h2>
        <p v-if="description" class="mx-auto mt-4 max-w-xl text-base/7 text-zinc-300 sm:text-lg/8">
          <LandingInlineCode :text="description" />
        </p>
        <div v-if="links?.length" class="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <UButton
            v-for="(link, index) in links"
            :key="link.to"
            v-bind="link"
            size="lg"
            :color="index === 0 ? 'primary' : 'neutral'"
            :variant="index === 0 ? 'solid' : 'ghost'"
            class="h-11 justify-center px-5 transition-transform active:scale-[0.96]"
            :class="index === 0 ? '' : 'text-zinc-200 hover:bg-white/10 hover:text-white'"
          />
        </div>
      </div>
    </UContainer>
  </section>
</template>
