import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readDotenvLocal, resolveConvexEnv } from '../../src/internal/env'

describe('convex env', () => {
  it('reads the .env.local written by `npx convex dev`', () => {
    const dir = mkdtempSync(join(tmpdir(), 'nc-server-env-'))
    writeFileSync(join(dir, '.env.local'), [
      '# Deployment used by `npx convex dev`',
      'CONVEX_DEPLOYMENT=dev:happy-otter-123 # team: me, project: app',
      '',
      'CONVEX_URL=https://happy-otter-123.convex.cloud',
    ].join('\n'))

    expect(resolveConvexEnv({}, readDotenvLocal(dir))).toEqual({
      url: 'https://happy-otter-123.convex.cloud',
      siteUrl: undefined,
      deployment: 'dev:happy-otter-123',
    })
  })

  it('returns nothing without a .env.local', () => {
    expect(readDotenvLocal(mkdtempSync(join(tmpdir(), 'nc-server-env-')))).toEqual({})
  })

  it('lets process.env win over .env.local', () => {
    expect(resolveConvexEnv({ CONVEX_URL: 'https://env.convex.cloud' }, { CONVEX_URL: 'http://127.0.0.1:3210', CONVEX_SITE_URL: 'http://127.0.0.1:3211' })).toEqual({
      url: 'https://env.convex.cloud',
      siteUrl: 'http://127.0.0.1:3211',
      deployment: undefined,
    })
  })
})
