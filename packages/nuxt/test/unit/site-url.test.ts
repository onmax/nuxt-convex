import { describe, expect, it } from 'vitest'
import { resolveConvexSiteUrl, toConvexSiteUrl } from '../../src/runtime/utils/site-url'

describe('convex site url', () => {
  it('derives the HTTP actions url', () => {
    expect(toConvexSiteUrl('https://happy-otter-123.convex.cloud')).toBe('https://happy-otter-123.convex.site')
    expect(toConvexSiteUrl('https://happy-otter-123.eu-west-1.convex.cloud/')).toBe('https://happy-otter-123.eu-west-1.convex.site')
    expect(toConvexSiteUrl('http://127.0.0.1:3210')).toBe('http://127.0.0.1:3211')
    expect(toConvexSiteUrl('https://convex.example.com')).toBeUndefined()
    expect(toConvexSiteUrl('nope')).toBeUndefined()
  })

  it('prefers an explicit site url', () => {
    expect(resolveConvexSiteUrl({ url: 'https://a.convex.cloud', siteUrl: 'https://auth.example.com' })).toBe('https://auth.example.com')
    expect(resolveConvexSiteUrl({ url: 'https://a.convex.cloud', siteUrl: '' })).toBe('https://a.convex.site')
    expect(resolveConvexSiteUrl(undefined)).toBeUndefined()
  })
})
