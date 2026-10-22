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
    class="flex flex-col"
    :ui="{ center: 'flex-1' }"
    :to="localePath('/')"
    :title="appConfig.header?.title || site.name"
  >
    <AppHeaderCenter />

    <template #title>
      <div class="flex items-center gap-2.5">
        <div class="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" class="size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="convex-mark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#F3B01C" />
                <stop offset="0.55" stop-color="#EE342F" />
                <stop offset="1" stop-color="#8D2676" />
              </linearGradient>
            </defs>
            <path fill="url(#convex-mark)" d="M15.09 18.916c3.488-.387 6.776-2.246 8.586-5.348c-.857 7.673-9.247 12.522-16.095 9.545a3.47 3.47 0 0 1-1.547-1.314c-1.539-2.417-2.044-5.492-1.318-8.282c2.077 3.584 6.3 5.78 10.374 5.399m-10.501-7.65c-1.414 3.266-1.475 7.092.258 10.24c-6.1-4.59-6.033-14.41-.074-18.953a3.440 3.440 0 0 1 1.893-.707c2.825-.15 5.695.942 7.708 2.977c-4.09.04-8.073 2.66-9.785 6.442m11.757-5.437C14.283 2.951 11.053.992 7.515.933c6.84-3.105 15.253 1.929 16.17 9.37a3.6 3.6 0 0 1-.334 2.02c-1.278 2.594-3.647 4.607-6.416 5.352c2.029-3.763 1.778-8.36-.589-11.847" />
          </svg>
          <span class="text-sm font-semibold text-highlighted">Convex</span>
        </div>
        <span class="text-sm text-dimmed" aria-hidden="true">×</span>
        <div class="flex items-center gap-1.5">
          <svg width="48" height="32" viewBox="0 0 48 32" fill="none" class="h-4 w-auto" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M26.88 32H44.64C45.2068 32.0001 45.7492 31.8009 46.24 31.52C46.7308 31.2391 47.2367 30.8865 47.52 30.4C47.8033 29.9135 48.0002 29.3615 48 28.7998C47.9998 28.2381 47.8037 27.6864 47.52 27.2001L35.52 6.56C35.2368 6.0736 34.8907 5.72084 34.4 5.44C33.9093 5.15916 33.2066 4.96 32.64 4.96C32.0734 4.96 31.5307 5.15916 31.04 5.44C30.5493 5.72084 30.2032 6.0736 29.92 6.56L26.88 11.84L20.8 1.59962C20.5165 1.11326 20.1708 0.600786 19.68 0.32C19.1892 0.0392139 18.6467 0 18.08 0C17.5133 0 16.9708 0.0392139 16.48 0.32C15.9892 0.600786 15.4835 1.11326 15.2 1.59962L0.32 27.2001C0.0363166 27.6864 0.000246899 28.2381 3.05588e-07 28.7998C-0.000246288 29.3615 0.0367437 29.9134 0.32 30.3999C0.603256 30.8864 1.10919 31.2391 1.6 31.52C2.09081 31.8009 2.63324 32.0001 3.2 32H14.4C18.8379 32 22.068 30.0092 24.32 26.24L29.76 16.8L32.64 11.84L41.44 26.88H29.76L26.88 32ZM14.24 26.88H6.4L18.08 6.72L24 16.8L20.0786 23.636C18.5831 26.0816 16.878 26.88 14.24 26.88Z" fill="#00DC82" />
          </svg>
          <span class="text-sm font-semibold text-highlighted">Nuxt</span>
        </div>
      </div>
    </template>

    <template #right>
      <template v-if="isEnabled && locales.length > 1">
        <ClientOnly>
          <LanguageSelect />

          <template #fallback>
            <div class="size-8 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
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
          <div class="size-8 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
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
