import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setupSubprocessE2E } from './helpers/subprocess-e2e'

const rootDir = fileURLToPath(new URL('./fixtures/better-auth-provider', import.meta.url))

describe('better-auth provider', () => {
  const fixture = setupSubprocessE2E({ rootDir })

  it('registers the convex provider and exposes the generated adapter contract', async () => {
    const res = await fixture.fetch<{
      providerCheck: {
        generatedCodeUsesAdapterImport: boolean
        generatedCodeUsesApiImport: boolean
        generatedCodeUsesConvexUrlOverride: boolean
        providerRegistered: boolean
        publicConvexUrl: string
        runtimeConvexUrl: string
      }
    }>('/api/provider')

    expect(res.providerCheck).toEqual({
      generatedCodeUsesAdapterImport: true,
      generatedCodeUsesApiImport: true,
      generatedCodeUsesConvexUrlOverride: true,
      providerRegistered: true,
      publicConvexUrl: 'https://test.convex.cloud',
      runtimeConvexUrl: 'https://override.convex.cloud',
    })
  })
})
