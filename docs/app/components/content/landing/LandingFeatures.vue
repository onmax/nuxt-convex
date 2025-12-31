<script setup lang="ts">
const features = [
  { title: 'Real-time by default', description: 'Queries auto-update when data changes. No manual refetching or polling needed.', icon: 'i-lucide-zap' },
  { title: 'Virtual modules', description: 'Import from #convex, #convex/api, and #convex/storage with full type safety.', icon: 'i-lucide-box' },
  { title: 'Auto-imports', description: 'Composables available globally without manual imports. Just use them.', icon: 'i-lucide-wand-2' },
  { title: 'File storage', description: 'Built-in upload API with progress tracking and auto-scaffolded Convex functions.', icon: 'i-lucide-hard-drive' },
  { title: 'DevTools', description: 'Convex dashboard tab integrated directly into Nuxt DevTools.', icon: 'i-lucide-bug' },
  { title: 'Type-safe', description: 'End-to-end TypeScript from database schema to Vue components.', icon: 'i-lucide-shield-check' },
]
</script>

<template>
  <section class="py-16 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Everything you need
        </h2>
        <p class="mt-3 text-lg text-stone-600 dark:text-stone-400">
          A complete integration that makes Convex feel native to Nuxt
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="p-6 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50"
        >
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <UIcon :name="feature.icon" class="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 class="font-semibold text-stone-900 dark:text-stone-100">
              {{ feature.title }}
            </h3>
          </div>
          <p class="text-sm text-stone-600 dark:text-stone-400">
            {{ feature.description }}
          </p>
        </div>
      </div>

      <div class="mt-16 text-center py-12 px-6 rounded-lg border border-stone-200 dark:border-stone-800 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-900/10 dark:to-transparent">
        <h3 class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">
          Ready to build?
        </h3>
        <p class="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
          Get started with Nuxt Convex in minutes. Real-time data, file storage, and more.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <UButton to="/getting-started/introduction" size="lg">
            Read the docs
          </UButton>
          <UButton to="https://docs.convex.dev" target="_blank" color="neutral" variant="outline" size="lg">
            Convex Docs
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>
