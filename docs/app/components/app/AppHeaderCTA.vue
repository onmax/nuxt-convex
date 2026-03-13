<script setup lang="ts">
const route = useRoute()

type HeaderLink = {
  label: string
  to: string
  color?: string
  variant?: string
}

const topLevelLinks: HeaderLink[] = [
  { label: 'Nuxt Docs', to: '/nuxt', color: 'primary', variant: 'soft' },
  { label: 'Vue Docs', to: '/vue', color: 'neutral', variant: 'ghost' },
  { label: 'Shared API', to: '/api-reference', color: 'neutral', variant: 'ghost' },
]

const nuxtLinks: HeaderLink[] = [
  { label: 'Overview', to: '/nuxt' },
  { label: 'Get Started', to: '/getting-started' },
  { label: 'Guide', to: '/nuxt-module' },
  { label: 'Integrations', to: '/integrations' },
  { label: 'API', to: '/api-reference' },
]

const vueLinks: HeaderLink[] = [
  { label: 'Overview', to: '/vue' },
  { label: 'Get Started', to: '/vue-core/installation' },
  { label: 'Manual Init', to: '/vue-core/manual-initialization' },
  { label: 'Composables', to: '/api-reference' },
  { label: 'Patterns', to: '/convex-patterns' },
]

const sharedLinks: HeaderLink[] = [
  { label: 'Nuxt Docs', to: '/nuxt' },
  { label: 'Vue Docs', to: '/vue' },
  { label: 'Shared API', to: '/api-reference' },
]

const links = computed(() => {
  if (route.path === '/nuxt' || route.path.startsWith('/getting-started') || route.path.startsWith('/nuxt-module') || route.path.startsWith('/integrations'))
    return nuxtLinks

  if (route.path === '/vue' || route.path.startsWith('/vue-core'))
    return vueLinks

  if (route.path.startsWith('/api-reference') || route.path.startsWith('/convex-patterns'))
    return sharedLinks

  return topLevelLinks
})
</script>

<template>
  <div
    v-if="links.length"
    class="hidden xl:flex items-center gap-1.5"
  >
    <UButton
      v-for="(link, index) in links"
      :key="index"
      size="sm"
      :label="link.label"
      :to="link.to"
      :color="route.path === link.to || route.path.startsWith(`${link.to}/`) ? 'primary' : (link.color || 'neutral')"
      :variant="route.path === link.to || route.path.startsWith(`${link.to}/`) ? 'soft' : (link.variant || 'ghost')"
    />
  </div>
</template>
