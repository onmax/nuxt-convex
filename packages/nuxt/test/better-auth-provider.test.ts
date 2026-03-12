import { fileURLToPath } from 'node:url'
import { setup } from '@nuxt/test-utils/e2e'
import { describe, it } from 'vitest'

const rootDir = fileURLToPath(new URL('./fixtures/better-auth-provider', import.meta.url))

describe('better-auth provider', async () => {
  await setup({ rootDir, dev: true })

  it('boots with convex provider registered', () => {
    // assertions are done in the fixture module (throws on failure)
  })
})
