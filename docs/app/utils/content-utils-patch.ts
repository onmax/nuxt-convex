// Patch findPageHeadline to always return a string (not an object)
export { findPageBreadcrumb, findPageChildren, findPageSiblings } from '@nuxt/content/dist/runtime/utils/index'

import { findPageHeadline as _findPageHeadline } from '@nuxt/content/dist/runtime/utils/index'
import type { ContentNavigationItem } from '@nuxt/content'

export function findPageHeadline(navigation?: ContentNavigationItem[], path?: string | undefined | null, options?: Record<string, unknown>): string | undefined {
  const result = _findPageHeadline(navigation, path, options)
  if (!result) return undefined
  if (typeof result === 'string') return result
  if (typeof result === 'object' && result !== null && 'title' in result) return String((result as Record<string, unknown>).title)
  return String(result)
}
