import type { Nuxt } from '@nuxt/schema'
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveConvexRoot } from '../src/internal/convex-paths'

function createNuxt(projectRoot: string, layers: string[]): Nuxt {
  return {
    options: {
      rootDir: projectRoot,
      srcDir: projectRoot,
      alias: {},
      _layers: layers.map(root => ({
        cwd: root,
        config: {
          rootDir: root,
          srcDir: root,
          dir: {},
        },
      })),
    },
  } as Nuxt
}

function withTempLayers<T>(run: (projectRoot: string, baseRoot: string) => T): T {
  const root = mkdtempSync(join(tmpdir(), 'nuxt-convex-'))
  const projectRoot = join(root, 'app')
  const baseRoot = join(root, 'base')
  mkdirSync(projectRoot, { recursive: true })
  mkdirSync(baseRoot, { recursive: true })

  try {
    return run(projectRoot, baseRoot)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
}

describe('resolveConvexRoot', () => {
  it('prefers the app layer when both app and base layers define the same directory', () => withTempLayers((projectRoot, baseRoot) => {
    mkdirSync(join(projectRoot, 'convex', '_generated'), { recursive: true })
    mkdirSync(join(baseRoot, 'convex', '_generated'), { recursive: true })

    const resolved = resolveConvexRoot(createNuxt(projectRoot, [projectRoot, baseRoot]), 'convex')

    expect(resolved.readDir).toBe(join(projectRoot, 'convex'))
    expect(resolved.writeDir).toBe(join(projectRoot, 'convex'))
    expect(resolved.usesProjectDefault).toBe(false)
  }))

  it('uses the nearest base layer when the app layer does not provide a convex directory', () => withTempLayers((projectRoot, baseRoot) => {
    mkdirSync(join(baseRoot, 'backend', 'convex', '_generated'), { recursive: true })

    const resolved = resolveConvexRoot(createNuxt(projectRoot, [projectRoot, baseRoot]), 'backend/convex')

    expect(resolved.readDir).toBe(join(baseRoot, 'backend', 'convex'))
    expect(resolved.writeDir).toBe(join(baseRoot, 'backend', 'convex'))
    expect(resolved.projectDir).toBe(join(projectRoot, 'backend', 'convex'))
  }))

  it('falls back to the project layer when no convex directory exists yet', () => withTempLayers((projectRoot, baseRoot) => {
    const resolved = resolveConvexRoot(createNuxt(projectRoot, [projectRoot, baseRoot]), 'convex')

    expect(resolved.readDir).toBe(join(projectRoot, 'convex'))
    expect(resolved.writeDir).toBe(join(projectRoot, 'convex'))
    expect(resolved.usesProjectDefault).toBe(true)
    expect(existsSync(resolved.readDir)).toBe(false)
  }))

  it('falls back writes to the project layer when the resolved layer lives in node_modules', () => withTempLayers((projectRoot) => {
    const dependencyLayer = join(projectRoot, 'node_modules', 'acme-layer')
    mkdirSync(join(dependencyLayer, 'convex', '_generated'), { recursive: true })

    const resolved = resolveConvexRoot(createNuxt(projectRoot, [projectRoot, dependencyLayer]), 'convex')

    expect(resolved.readDir).toBe(join(dependencyLayer, 'convex'))
    expect(resolved.writeDir).toBe(join(projectRoot, 'convex'))
    expect(resolved.fallsBackToProjectWrite).toBe(true)
  }))

  it('keeps reading from the generated layer when the project directory only exists for scaffolding', () => withTempLayers((projectRoot) => {
    const dependencyLayer = join(projectRoot, 'node_modules', 'acme-layer')
    mkdirSync(join(projectRoot, 'convex', '_hub'), { recursive: true })
    mkdirSync(join(dependencyLayer, 'convex', '_generated'), { recursive: true })

    const resolved = resolveConvexRoot(createNuxt(projectRoot, [projectRoot, dependencyLayer]), 'convex')

    expect(resolved.readDir).toBe(join(dependencyLayer, 'convex'))
    expect(resolved.writeDir).toBe(join(projectRoot, 'convex'))
    expect(resolved.fallsBackToProjectWrite).toBe(true)
  }))
})
