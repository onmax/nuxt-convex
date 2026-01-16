<script setup lang="ts">
</script>

<template>
  <section class="relative w-full flex items-center justify-center min-h-[32rem] md:min-h-[36rem]">
    <div class="px-4 py-16 mx-auto relative z-10 max-w-4xl text-center">
      <div class="space-y-6">
        <div class="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
          <UIcon name="i-lucide-zap" class="size-4" />
          <span class="text-sm font-medium">Real-time by default</span>
        </div>

        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Convex for <span class="text-amber-600 dark:text-amber-400">Nuxt</span>
        </h1>

        <p class="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
          Reactive backend with real-time sync, file storage, and auto-imports. Build full-stack apps with type-safe queries that update instantly.
        </p>

        <div class="flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 dark:bg-stone-900 rounded-lg font-mono text-sm max-w-md mx-auto">
          <span class="text-stone-500">$</span>
          <span class="text-stone-800 dark:text-stone-200">pnpm add nuxt-convex convex</span>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <UButton to="/getting-started/introduction" size="lg" class="w-full sm:w-auto">
            Get Started
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </UButton>
          <UButton to="https://github.com/onmax/nuxt-convex" target="_blank" color="neutral" variant="outline" size="lg" class="w-full sm:w-auto">
            <UIcon name="i-simple-icons-github" class="size-4" />
            GitHub
          </UButton>
        </div>

        <div class="flex items-center justify-center gap-6 pt-4 text-sm text-stone-500">
          <NuxtLink to="https://demo-nuxt-convex.onmax.me" target="_blank" class="flex items-center gap-1.5 hover:text-amber-600 transition-colors">
            <UIcon name="i-lucide-play" class="size-3.5" />
            Live Demo
          </NuxtLink>
          <NuxtLink to="https://docs.convex.dev" target="_blank" class="flex items-center gap-1.5 hover:text-amber-600 transition-colors">
            <UIcon name="i-lucide-external-link" class="size-3.5" />
            Convex Docs
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
