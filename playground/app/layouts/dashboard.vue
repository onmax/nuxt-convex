<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const runtimeConfig = useRuntimeConfig()
const convex = runtimeConfig.public.convex as { storage?: boolean, r2?: boolean } | undefined

const open = ref(false)

const mainNav = computed<NavigationMenuItem[]>(() => {
  const items: NavigationMenuItem[] = [{
    label: 'Tasks',
    icon: 'i-lucide-list-todo',
    to: '/dashboard',
    exact: true,
    onSelect: () => { open.value = false },
  }]

  if (convex?.storage !== false) {
    items.push({
      label: 'Storage',
      icon: 'i-lucide-cloud-upload',
      to: '/dashboard/storage',
      onSelect: () => { open.value = false },
    })
  }

  if (convex?.r2 !== false) {
    items.push({
      label: 'Cloudflare R2',
      icon: 'i-simple-icons-cloudflare',
      to: '/dashboard/r2',
      onSelect: () => { open.value = false },
    })
  }

  items.push({
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/dashboard/settings',
    onSelect: () => { open.value = false },
  })

  return items
})

const secondaryNav: NavigationMenuItem[] = [{
  label: 'Documentation',
  icon: 'i-lucide-book-open',
  to: 'https://nuxt-convex.onmax.me',
  target: '_blank',
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  to: 'https://github.com/onmax/nuxt-convex',
  target: '_blank',
}]
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="main"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2 p-1" :class="[collapsed && 'justify-center']">
          <UIcon name="i-simple-icons-nuxtdotjs" class="size-5 text-[var(--color-nuxt)]" />
          <span v-if="!collapsed" class="text-sm font-medium text-muted">+</span>
          <UIcon v-if="!collapsed" name="i-custom-convex" class="size-4 text-[var(--color-convex-500)]" />
          <span v-if="!collapsed" class="text-sm font-semibold text-highlighted">Playground</span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="mainNav"
          orientation="vertical"
          tooltip
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="secondaryNav"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
