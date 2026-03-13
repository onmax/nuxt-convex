import type { ContentNavigationItem } from '@nuxt/content'

type DocsModuleTab = {
  label: string
  to: string
}

type DocsModule = {
  id: string
  label: string
  to: string
  match: string[]
  sidebarRoots: string[]
  tabs: DocsModuleTab[]
}

function matchesPath(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`)
}

export function useDocsModules() {
  const route = useRoute()
  const appConfig = useAppConfig()

  const modules = computed(() => (appConfig.docsModules || []) as DocsModule[])

  const activeModule = computed(() => modules.value.find(module => module.match.some(prefix => matchesPath(route.path, prefix))) || null)
  const activeTabs = computed(() => activeModule.value?.tabs || [])

  function isModuleActive(module: DocsModule) {
    return module.match.some(prefix => matchesPath(route.path, prefix))
  }

  function isTabActive(tab: DocsModuleTab) {
    return matchesPath(route.path, tab.to)
  }

  function filterNavigation(items?: ContentNavigationItem[]) {
    if (!items?.length)
      return []

    const roots = activeModule.value?.sidebarRoots

    if (!roots?.length)
      return items

    return items.filter(item => roots.some(root => matchesPath(item.path, root)))
  }

  return {
    activeModule,
    activeTabs,
    filterNavigation,
    isModuleActive,
    isTabActive,
    modules,
  }
}
