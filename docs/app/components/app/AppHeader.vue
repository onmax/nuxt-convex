<script setup lang="ts">
const appConfig = useAppConfig()
const site = useSiteConfig()

const { localePath, isEnabled, locales } = useDocusI18n()
const { modules, activeModule, isModuleActive } = useDocsModules()

const links = computed(() => appConfig.github && appConfig.github.url
  ? [
      {
        'icon': 'i-simple-icons-github',
        'to': appConfig.github.url,
        'target': '_blank',
        'aria-label': 'GitHub',
      },
    ]
  : [])
</script>

<template>
  <UHeader
    :ui="{ center: 'flex-1' }"
    :to="localePath('/')"
    :title="appConfig.header?.title || site.name"
  >
    <AppHeaderCenter />

    <template #title>
      <div class="flex items-center gap-2.5">
        <!-- Convex -->
        <div class="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" class="h-5 w-auto" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.5 11.5L2 2h7.5l13 18h-7.5l-3-4.5-3 4.5H2l7.5-8.5Z" class="fill-convex-500" />
            <path d="M15.5 2h7l-5.5 8-3.5-5 2-3Z" class="fill-convex-500" />
          </svg>
          <span class="font-semibold text-sm select-none">Convex</span>
        </div>
        <span class="text-black/30 dark:text-white/30 text-sm select-none">×</span>
        <!-- Nuxt -->
        <div class="flex items-center gap-1.5">
          <svg width="48" height="32" viewBox="0 0 48 32" fill="none" class="h-4 w-auto" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.88 32H44.64C45.2068 32.0001 45.7492 31.8009 46.24 31.52C46.7308 31.2391 47.2367 30.8865 47.52 30.4C47.8033 29.9135 48.0002 29.3615 48 28.7998C47.9998 28.2381 47.8037 27.6864 47.52 27.2001L35.52 6.56C35.2368 6.0736 34.8907 5.72084 34.4 5.44C33.9093 5.15916 33.2066 4.96 32.64 4.96C32.0734 4.96 31.5307 5.15916 31.04 5.44C30.5493 5.72084 30.2032 6.0736 29.92 6.56L26.88 11.84L20.8 1.59962C20.5165 1.11326 20.1708 0.600786 19.68 0.32C19.1892 0.0392139 18.6467 0 18.08 0C17.5133 0 16.9708 0.0392139 16.48 0.32C15.9892 0.600786 15.4835 1.11326 15.2 1.59962L0.32 27.2001C0.0363166 27.6864 0.000246899 28.2381 3.05588e-07 28.7998C-0.000246288 29.3615 0.0367437 29.9134 0.32 30.3999C0.603256 30.8864 1.10919 31.2391 1.6 31.52C2.09081 31.8009 2.63324 32.0001 3.2 32H14.4C18.8379 32 22.068 30.0092 24.32 26.24L29.76 16.8L32.64 11.84L41.44 26.88H29.76L26.88 32ZM14.24 26.88H6.4L18.08 6.72L24 16.8L20.0786 23.636C18.5831 26.0816 16.878 26.88 14.24 26.88Z" class="fill-black dark:fill-white" />
          </svg>
          <span class="font-semibold text-sm select-none">Nuxt</span>
        </div>
      </div>
    </template>

    <template #right>
      <template v-if="isEnabled && locales.length > 1">
        <ClientOnly>
          <LanguageSelect />

          <template #fallback>
            <div class="h-8 w-8 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
          </template>
        </ClientOnly>

        <USeparator
          orientation="vertical"
          class="h-8"
        />
      </template>

      <UContentSearchButton class="lg:hidden" />

      <ClientOnly>
        <UColorModeButton />

        <template #fallback>
          <div class="h-8 w-8 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
        </template>
      </ClientOnly>

      <template v-if="links.length">
        <UButton
          v-for="(link, index) of links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>

    <template #toggle="{ open, toggle }">
      <IconMenuToggle
        :open="open"
        class="lg:hidden"
        @click="toggle"
      />
    </template>

    <template #body>
      <AppHeaderBody />
    </template>

    <template
      v-if="activeModule"
      #bottom
    >
      <div class="docs-subheader hidden lg:block border-t border-default">
      <UContainer class="flex items-center">
        <UNavigationMenu
          :items="modules.map(m => ({ label: m.label, to: m.to, icon: m.id === 'vue' ? 'i-simple-icons-vuedotjs' : m.id === 'nuxt' ? 'i-simple-icons-nuxtdotjs' : undefined, active: isModuleActive(m) }))"
          variant="pill"
          highlight
          class="-mx-2.5 -mb-px"
        />
      </UContainer>
      </div>
    </template>
  </UHeader>
</template>
