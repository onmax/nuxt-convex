import { fileURLToPath } from 'node:url'
import { describe, it } from 'vitest'
import { setupSubprocessE2E } from './helpers/subprocess-e2e'

const rootDir = fileURLToPath(new URL('./fixtures/better-auth-provider', import.meta.url))

describe('better-auth provider', () => {
  setupSubprocessE2E({ rootDir })

  it('boots with convex provider registered', () => {
    // assertions are done in the fixture module (throws on failure)
  })
})
