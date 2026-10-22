import type { ContentNavigationItem } from '@nuxt/content'
import type { ComputedRef } from 'vue'

interface DocsModule {
  id: string
  label: string
  to: string
  match: string[]
  sidebarRoots: string[]
}

function matchesPath(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`)
}

export function useDocsModules(): {
  activeModule: ComputedRef<DocsModule | null>
  filterNavigation: (items?: ContentNavigationItem[]) => ContentNavigationItem[]
  isModuleActive: (module: DocsModule) => boolean
  modules: ComputedRef<DocsModule[]>
} {
  const route = useRoute()
  const appConfig = useAppConfig()

  const modules = computed(() => (appConfig.docsModules || []) as DocsModule[])

  // The first module that matches wins, so a path listed by two modules highlights one tab
  const activeModule = computed(() => modules.value.find(module => module.match.some(prefix => matchesPath(route.path, prefix))) || null)

  function isModuleActive(module: DocsModule): boolean {
    return activeModule.value?.id === module.id
  }

  // Pages match exactly, so a section's index page isn't highlighted alongside the page you're on
  function markPagesExact(item: ContentNavigationItem): ContentNavigationItem {
    return item.children?.length
      ? { ...item, children: item.children.map(markPagesExact) }
      : { ...item, exact: true }
  }

  function filterNavigation(items?: ContentNavigationItem[]): ContentNavigationItem[] {
    if (!items?.length)
      return []

    const roots = activeModule.value?.sidebarRoots
    const filtered = roots?.length ? items.filter(item => roots.some(root => matchesPath(item.path, root))) : items
    return filtered.map(markPagesExact)
  }

  return {
    activeModule,
    filterNavigation,
    isModuleActive,
    modules,
  }
}
