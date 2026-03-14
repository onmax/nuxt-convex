<script setup lang="ts">
const appConfig = useAppConfig()
const site = useSiteConfig()

const { localePath, isEnabled, locales } = useDocusI18n()
const { modules, isModuleActive } = useDocsModules()

const links = computed(() => appConfig.github && appConfig.github.url
  ? [
      {
        icon: 'i-simple-icons-github',
        to: appConfig.github.url,
        target: '_blank',
        'aria-label': 'GitHub',
      },
    ]
  : [])
</script>

<template>
  <div class="border-b border-default">
    <UHeader
      :ui="{ center: 'flex-1' }"
      :to="localePath('/')"
      :title="appConfig.header?.title || site.name"
    >
      <AppHeaderCenter />

      <template #title>
        <AppHeaderLogo class="h-6 w-auto shrink-0" />
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
    </UHeader>

    <div
      v-if="modules.length"
      class="hidden border-t border-default lg:block"
    >
      <UContainer class="flex items-center gap-1 overflow-x-auto py-2">
        <UButton
          v-for="module in modules"
          :key="module.id"
          :to="module.to"
          size="sm"
          :label="module.label"
          :color="isModuleActive(module) ? 'primary' : 'neutral'"
          :variant="isModuleActive(module) ? 'soft' : 'ghost'"
        />
      </UContainer>
    </div>
  </div>
</template>
