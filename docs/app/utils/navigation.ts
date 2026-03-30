import type { ContentNavigationItem } from '@nuxt/content'

export function transformNavigation(
  data: ContentNavigationItem[],
  isI18nEnabled: boolean,
  locale?: string,
): ContentNavigationItem[] {
  if (isI18nEnabled && locale) {
    const localizedRoot = data.find(item => item.path === `/${locale}`)?.children ?? data
    return localizedRoot.find(item => item.path === `/${locale}/docs`)?.children ?? localizedRoot
  }

  return data.find(item => item.path === '/docs')?.children ?? data
}
