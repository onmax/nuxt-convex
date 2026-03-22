<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{ collapsed?: boolean }>()

const colorMode = useColorMode()
const { user, signOut } = useUserSession()

const items = computed<DropdownMenuItem[][]>(() => [[{
  type: 'label',
  label: user.value?.name || 'User',
  avatar: { src: user.value?.image || undefined, alt: user.value?.name },
}], [{
  label: 'Appearance',
  icon: 'i-lucide-sun-moon',
  children: [{
    label: 'Light',
    icon: 'i-lucide-sun',
    type: 'checkbox',
    checked: colorMode.value === 'light',
    onSelect(e: Event) {
      e.preventDefault()
      colorMode.preference = 'light'
    },
  }, {
    label: 'Dark',
    icon: 'i-lucide-moon',
    type: 'checkbox',
    checked: colorMode.value === 'dark',
    onSelect(e: Event) {
      e.preventDefault()
      colorMode.preference = 'dark'
    },
  }],
}], [{
  label: 'Documentation',
  icon: 'i-lucide-book-open',
  to: 'https://nuxt-convex.onmax.me',
  target: '_blank',
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  to: 'https://github.com/onmax/nuxt-convex',
  target: '_blank',
}], [{
  label: 'Sign out',
  icon: 'i-lucide-log-out',
  onSelect: () => signOut(),
}]])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        avatar: { src: user?.image || undefined, alt: user?.name },
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{ trailingIcon: 'text-dimmed' }"
    />
  </UDropdownMenu>
</template>
