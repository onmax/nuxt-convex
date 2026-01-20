<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const convexUrl = useRuntimeConfig().public.convex?.url as string | undefined

type TabValue = 'queries' | 'mutations' | 'pagination' | 'storage' | 'actions'

const tabs: Array<{ label: string, value: TabValue, icon: string }> = [
  { label: 'Queries', value: 'queries', icon: 'i-heroicons-magnifying-glass' },
  { label: 'Mutations', value: 'mutations', icon: 'i-heroicons-pencil-square' },
  { label: 'Pagination', value: 'pagination', icon: 'i-heroicons-list-bullet' },
  { label: 'Storage', value: 'storage', icon: 'i-heroicons-cloud-arrow-up' },
  { label: 'Actions', value: 'actions', icon: 'i-heroicons-bolt' },
]

const demoComponents: Record<TabValue, ReturnType<typeof resolveComponent>> = {
  queries: resolveComponent('DemosQueriesDemo'),
  mutations: resolveComponent('DemosMutationsDemo'),
  pagination: resolveComponent('DemosPaginationDemo'),
  storage: resolveComponent('DemosStorageDemo'),
  actions: resolveComponent('DemosActionsDemo'),
}
</script>

<template>
  <div class="min-h-screen bg-default">
    <div class="max-w-5xl mx-auto px-6 py-8">
      <AppHeader show-user class="mb-8" />

      <ClientOnly>
        <UTabs :items="tabs" class="w-full" default-value="queries">
          <template #content="{ item }">
            <div class="mt-6">
              <component :is="demoComponents[item.value as TabValue]" />
            </div>
          </template>
        </UTabs>

        <template #fallback>
          <div class="flex justify-center py-12">
            <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-muted" />
          </div>
        </template>
      </ClientOnly>

      <p class="text-center text-xs text-dimmed mt-8">
        Connected to <code class="text-muted">{{ convexUrl }}</code>
      </p>
    </div>
  </div>
</template>
