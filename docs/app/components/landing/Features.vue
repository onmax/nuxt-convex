<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
  items: { icon: string, title: string, description: string }[]
}>()
</script>

<template>
  <section class="py-20 sm:py-28">
    <UContainer>
      <LandingSectionHeading :eyebrow="eyebrow" :title="title" :description="description" />

      <ul class="mx-auto grid max-w-5xl gap-px overflow-hidden rounded-2xl bg-(--ui-border) shadow-[0_0_0_1px_var(--ui-border)] sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="item in items"
          :key="item.title"
          class="bg-default p-6 sm:p-8"
        >
          <div class="flex size-10 items-center justify-center rounded-[10px] bg-muted text-primary shadow-[inset_0_0_0_1px_var(--ui-border)]">
            <UIcon :name="item.icon" class="size-5" aria-hidden="true" />
          </div>
          <h3 class="mt-5 text-base font-semibold text-highlighted">
            {{ item.title }}
          </h3>
          <p class="mt-2 text-[15px]/6 text-muted">
            <LandingInlineCode :text="item.description" />
          </p>
        </li>
      </ul>
    </UContainer>
  </section>
</template>
