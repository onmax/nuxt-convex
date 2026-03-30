import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = resolve(process.cwd(), '../..')
const ignoredDirectories = new Set(['.cache', '.nuxt', '.output', '.wrangler', 'node_modules'])

function collectFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name))
        return []
      return collectFiles(path)
    }
    if (entry.isFile())
      return path
    return []
  })
}

function search(pattern: string): string {
  const roots = ['docs/content', 'playground'].map(path => join(repoRoot, path))

  for (const root of roots) {
    for (const file of collectFiles(root)) {
      const contents = readFileSync(file, 'utf8')
      const line = contents.split('\n').findIndex(nextLine => nextLine.includes(pattern))
      if (line >= 0)
        return `${file}:${line + 1}`
    }
  }

  return ''
}

describe('docs contract', () => {
  it('does not document storage helpers on the root Vue entrypoint', () => {
    expect(search(`import { useConvexStorage } from 'vue-convex'`)).toBe('')
    expect(search(`import { useConvexUpload } from 'vue-convex'`)).toBe('')
  })

  it('does not document advanced helpers on the root Vue entrypoint', () => {
    expect(search(`import { useConvexClient } from 'vue-convex'`)).toBe('')
    expect(search(`import { useConvexHttpClient } from 'vue-convex'`)).toBe('')
    expect(search(`import { useConvexController } from 'vue-convex'`)).toBe('')
    expect(search(`import { createConvexVueController } from 'vue-convex'`)).toBe('')
  })
})
