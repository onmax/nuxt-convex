import { describe, expect, it } from 'vitest'
import { resolveDashboardUrl } from '../../src/internal/dashboard'

describe('resolveDashboardUrl', () => {
  it('uses the deployment name from CONVEX_DEPLOYMENT', () => {
    expect(resolveDashboardUrl({ deployment: 'dev:happy-otter-123' })).toBe('https://dashboard.convex.dev/d/happy-otter-123')
    expect(resolveDashboardUrl({ deployment: 'prod:calm-cat-1', url: 'https://other.convex.cloud' })).toBe('https://dashboard.convex.dev/d/calm-cat-1')
    expect(resolveDashboardUrl({ deployment: 'local:local-me-app' })).toBe('https://dashboard.convex.dev/d/local-me-app')
  })

  it('uses the local dashboard for anonymous deployments', () => {
    expect(resolveDashboardUrl({ deployment: 'anonymous:anonymous-app' })).toBe('http://127.0.0.1:6790/')
    expect(resolveDashboardUrl({ url: 'http://127.0.0.1:3210' })).toBe('http://127.0.0.1:6790/')
  })

  it('derives the deployment name from a .convex.cloud url', () => {
    expect(resolveDashboardUrl({ url: 'https://happy-otter-123.convex.cloud' })).toBe('https://dashboard.convex.dev/d/happy-otter-123')
    expect(resolveDashboardUrl({ url: 'https://happy-otter-123.eu-west-1.convex.cloud' })).toBe('https://dashboard.convex.dev/d/happy-otter-123')
  })

  it('skips self-hosted and unknown deployments', () => {
    expect(resolveDashboardUrl({ url: 'https://convex.example.com' })).toBeUndefined()
    expect(resolveDashboardUrl({ url: 'not a url' })).toBeUndefined()
    expect(resolveDashboardUrl({})).toBeUndefined()
  })
})
