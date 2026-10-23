<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
  steps: { icon: string, title: string, description: string, label: string }[]
  link?: { label: string, to: string }
}>()
</script>

<template>
  <section class="py-20 sm:py-28">
    <UContainer>
      <LandingSectionHeading :eyebrow :title :description />

      <ol class="relative mx-auto grid max-w-5xl gap-4 lg:grid-cols-3 lg:gap-6">
        <div
          class="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[2.75rem] hidden h-px bg-[linear-gradient(90deg,transparent,var(--ui-border-accented)_12%,var(--ui-border-accented)_88%,transparent)] lg:block"
          aria-hidden="true"
        />
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="relative flex flex-col rounded-2xl bg-default p-6 shadow-[0_0_0_1px_var(--ui-border)]"
        >
          <div class="flex items-center justify-between">
            <div class="relative flex size-10 items-center justify-center rounded-[10px] bg-muted text-primary shadow-[inset_0_0_0_1px_var(--ui-border)]">
              <UIcon :name="step.icon" class="size-5" aria-hidden="true" />
            </div>
            <span class="font-mono text-[12px] tabular-nums text-muted">0{{ index + 1 }}</span>
          </div>
          <h3 class="mt-5 text-base font-semibold text-highlighted">
            {{ step.title }}
          </h3>
          <p class="mt-2 text-[15px]/6 text-muted">
            <LandingInlineCode :text="step.description" />
          </p>
          <p class="mt-5 inline-flex w-fit items-center gap-1.5 rounded-md bg-muted px-2 py-1 font-mono text-[12px] text-toned shadow-[inset_0_0_0_1px_var(--ui-border)]">
            {{ step.label }}
          </p>
        </li>
      </ol>

      <div v-if="link" class="mt-10 text-center">
        <UButton :to="link.to" :label="link.label" color="neutral" variant="link" trailing-icon="i-lucide-arrow-right" />
      </div>
    </UContainer>
  </section>
</template>
