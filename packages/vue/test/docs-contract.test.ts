import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = resolve(process.cwd(), '../..')

function search(pattern: string): string {
  try {
    return execFileSync('rg', ['-n', '-F', pattern, 'docs/content', 'playground'], {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim()
  }
  catch (error) {
    const result = error as { status?: number, stdout?: string }
    if (result.status === 1)
      return ''
    throw error
  }
}

describe('docs contract', () => {
  it('does not document storage helpers on the root Vue entrypoint', () => {
    expect(search(`import { useConvexStorage } from '@onmax/convex-vue'`)).toBe('')
    expect(search(`import { useConvexUpload } from '@onmax/convex-vue'`)).toBe('')
  })

  it('does not document advanced helpers on the root Vue entrypoint', () => {
    expect(search(`import { useConvexClient } from '@onmax/convex-vue'`)).toBe('')
    expect(search(`import { useConvexHttpClient } from '@onmax/convex-vue'`)).toBe('')
    expect(search(`import { useConvexController } from '@onmax/convex-vue'`)).toBe('')
    expect(search(`import { createConvexVueController } from '@onmax/convex-vue'`)).toBe('')
  })
})
