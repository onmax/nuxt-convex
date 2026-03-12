import type { Nuxt } from '@nuxt/schema'
import { accessSync, constants, existsSync } from 'node:fs'
import { getLayerDirectories } from '@nuxt/kit'
import { dirname, isAbsolute, join, normalize, relative } from 'pathe'

export interface ResolvedConvexRoot {
  input: string
  projectDir: string
  readDir: string
  writeDir: string
  generatedDir: string
  usesProjectDefault: boolean
  fallsBackToProjectWrite: boolean
}

function hasNodeModulesSegment(path: string): boolean {
  return normalize(path).split('/').includes('node_modules')
}

function hasGeneratedApiTypes(path: string): boolean {
  const generatedDir = join(path, '_generated')
  return ['api.ts', 'api.js', 'api.d.ts', 'api.mjs']
    .some(file => existsSync(join(generatedDir, file)))
}

function findNearestExistingParent(path: string): string | undefined {
  let current = path

  while (!existsSync(current)) {
    const parent = dirname(current)
    if (parent === current)
      return
    current = parent
  }

  return current
}

function isWritablePath(path: string): boolean {
  const target = findNearestExistingParent(path)
  if (!target)
    return false

  try {
    accessSync(target, constants.W_OK)
    return true
  }
  catch {
    return false
  }
}

function toProjectConvexDir(nuxt: Nuxt, input: string): string {
  const projectRoot = getLayerDirectories(nuxt)[0]?.root || nuxt.options.rootDir
  return join(projectRoot, isAbsolute(input) ? 'convex' : input)
}

export function resolveConvexRoot(nuxt: Nuxt, input = 'convex'): ResolvedConvexRoot {
  const projectDir = toProjectConvexDir(nuxt, input)

  if (isAbsolute(input)) {
    const readDir = input
    const generatedDir = join(readDir, '_generated')
    const fallsBackToProjectWrite = hasNodeModulesSegment(readDir) || !isWritablePath(readDir)
    return {
      input,
      projectDir,
      readDir,
      writeDir: fallsBackToProjectWrite ? projectDir : readDir,
      generatedDir,
      usesProjectDefault: !existsSync(readDir),
      fallsBackToProjectWrite,
    }
  }

  const layerDirs = getLayerDirectories(nuxt)
  const candidates = layerDirs
    .map(layer => join(layer.root, input))
  const generatedDirCandidate = candidates.find(candidate => hasGeneratedApiTypes(candidate))
  const authoritativeDir = (
    generatedDirCandidate
    || candidates
      .find(candidate => existsSync(candidate))
      || projectDir
  )
  const readDir = authoritativeDir
  const generatedDir = join(readDir, '_generated')

  const fallsBackToProjectWrite = hasNodeModulesSegment(readDir) || !isWritablePath(readDir)

  return {
    input,
    projectDir,
    readDir,
    writeDir: fallsBackToProjectWrite ? projectDir : readDir,
    generatedDir,
    usesProjectDefault: readDir === projectDir && !existsSync(readDir),
    fallsBackToProjectWrite,
  }
}

export function resolveStorageServerImportPath(convexRoot: ResolvedConvexRoot): string {
  return toImportPath(join(convexRoot.writeDir, '_hub'), join(convexRoot.generatedDir, 'server'))
}

export function toImportPath(fromDir: string, target: string): string {
  const importPath = relative(fromDir, target)
  return importPath.startsWith('.') ? importPath : `./${importPath}`
}

export function formatProjectRelativePath(nuxt: Nuxt, path: string): string {
  const importPath = relative(nuxt.options.rootDir, path)
  if (!importPath || importPath.startsWith('..'))
    return path
  return importPath
}
