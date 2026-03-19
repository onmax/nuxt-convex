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
    const result = error as { status?: number }
    if (result.status === 1)
      return ''
    throw error
  }
}

describe('docs contract', () => {
  it('does not document a #convex/r2 virtual module', () => {
    expect(search('#convex/r2')).toBe('')
    expect(search(`import { useUploadFile } from '#convex/r2'`)).toBe('')
  })
})
