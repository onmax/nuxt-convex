<template>
  <ClientOnly>
    <DashboardStoragePanel />
    <template #fallback>
      <div class="flex justify-center py-16">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin text-muted" />
      </div>
    </template>
  </ClientOnly>
</template>
