import type { Nuxt, NuxtModule } from '@nuxt/schema'
import type { ResolvedConvexRoot } from './internal/convex-paths'
import type { ResolvedConvexOptions } from './internal/options'
import type { ConvexConfig } from './types/config'
import { existsSync, watch } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { addComponent, addImports, addPlugin, addServerHandler, addServerImports, addTemplate, addTypeTemplate, createResolver, defineNuxtModule, getNitroVersion, hasNuxtModule, resolveModule, updateTemplates } from '@nuxt/kit'
import { consola } from 'consola'
import { defu } from 'defu'
import { join } from 'pathe'
import { version } from '../package.json'
import { formatProjectRelativePath, resolveConvexRoot, resolveStorageServerImportPath, toImportPath } from './internal/convex-paths'
import { resolveDashboardUrl } from './internal/dashboard'
import { readDotenvLocal } from './internal/env'
import { resolveConvexOptions } from './internal/options'
import { buildStorageFunctions, isUnguardedStorageScaffold } from './internal/storage-scaffold'

export * from './types/index'

const log = consola.withTag('nuxt:convex')

const rootAutoImports = [
  'useConvexQuery',
  'useConvexQueries',
  'useConvexMutation',
  'useConvexAction',
  'useConvexPaginatedQuery',
  'useConvexAuth',
  'useConvexConnectionState',
  'isConvexError',
] as const

const storageAutoImports = [
  'useConvexStorage',
  'useConvexUpload',
] as const

const serverAutoImports = [
  'useConvexServer',
  'serverConvexQuery',
  'serverConvexMutation',
  'serverConvexAction',
  'getConvexToken',
  'requireConvexAuth',
  'toConvexH3Error',
] as const

type Resolve = (path: string) => string

const module: NuxtModule<ConvexConfig> = defineNuxtModule<ConvexConfig>({
  meta: {
    name: 'nuxt-convex',
    version,
    configKey: 'convex',
    // The server runtime is written against `nuxt/server`, added in 4.6
    compatibility: { nuxt: '>=4.6.0 <6.0.0' },
  },
  defaults: {
    dir: 'convex',
    storage: false,
    r2: false,
  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const betterAuthOptions = (nuxt.options as { auth?: { clientOnly?: boolean, database?: { provider?: string } } }).auth

    if (betterAuthOptions?.database?.provider === 'convex') {
      throw new Error('[nuxt-convex] The `convex` Better Auth database provider was removed: it needed public, unauthenticated CRUD functions over your auth tables. '
        + 'Run Better Auth inside Convex with `@convex-dev/better-auth` and set `auth.clientOnly: true`; nuxt-convex proxies `/api/auth/**` to it.')
    }
    if (options.server !== undefined)
      log.warn('`convex.server` is deprecated, use `convex.ssr` instead.')

    const config = resolveConvexOptions(options, {
      env: process.env,
      dotenvLocal: nuxt.options.dev ? readDotenvLocal(nuxt.options.rootDir) : undefined,
      betterAuth: hasNuxtModule('@nuxtjs/better-auth', nuxt) ? { clientOnly: betterAuthOptions?.clientOnly ?? false } : undefined,
    })
    const convexRoot = resolveConvexRoot(nuxt, config.dir)

    nuxt.options.runtimeConfig.public.convex = defu(
      nuxt.options.runtimeConfig.public.convex as Record<string, unknown> | undefined,
      config.runtime,
    )

    addPlugin(resolve('./runtime/plugin'))
    if (config.runtime.auth.provider === 'better-auth' && hasNuxtModule('@nuxtjs/better-auth', nuxt))
      addPlugin({ src: resolve('./runtime/better-auth/plugin'), mode: 'client' }, { append: true })

    dedupeConvex(nuxt)
    setupConvexApiAlias(nuxt, convexRoot)
    setupConvexExports(nuxt, resolve)
    setupConvexAdvanced(nuxt)
    setupInternalStorageRefsRuntime(nuxt, convexRoot)
    setupServer(nuxt, resolve, config)

    if (config.runtime.storage) {
      setupConvexStorage(nuxt)
      await scaffoldStorageFunctions(nuxt, convexRoot)
    }
    else {
      setupStorageRuntimeFallback(nuxt)
    }

    if (config.runtime.r2)
      addImports({ name: 'useConvexR2Upload', from: resolve('./runtime/composables/useConvexR2Upload') })

    if (nuxt.options.dev) {
      if (config.devtools)
        addConvexDevTools(nuxt, config)
      watchGeneratedDir(nuxt, convexRoot)
      if (config.runtime.url)
        log.debug(`Convex URL: ${config.runtime.url}`)
      else
        log.warn('Convex URL not configured. Run `npx convex dev` or set CONVEX_URL.')
    }
  },
})

export default module

/**
 * Resolve `convex` once, from the app root, in every Vite environment.
 *
 * Besides keeping a single Convex client instance, this keeps `convex/*` imports bare in the
 * SSR build. Without it, Nuxt's `nuxt:resolve-externals` plugin rewrites `convex/browser`
 * imported from an inlined dependency (vue-convex) into an absolute path to
 * `convex/dist/esm/browser/index-node.js`. Nitro cannot map that file back to a package
 * export, so it inlines Convex and emits Convex's internal `../index.js` import as a broken
 * relative path.
 */
function dedupeConvex(nuxt: Nuxt): void {
  nuxt.options.vite.resolve ||= {}
  const dedupe = nuxt.options.vite.resolve.dedupe ||= []
  if (!dedupe.includes('convex'))
    dedupe.push('convex')
  // Pre-bundle up front: `convex/_generated/api.js` imports `convex/server`, and finding it on the
  // first page load makes Vite re-optimize and reload the page
  nuxt.options.vite.optimizeDeps ||= {}
  const include = nuxt.options.vite.optimizeDeps.include ||= []
  for (const id of ['convex/browser', 'convex/server', 'convex/values']) {
    if (!include.includes(id))
      include.push(id)
  }
  // One copy of vue-convex (and its injection key) in the SSR bundle
  nuxt.options.build.transpile.push('vue-convex')
}

/** Absolute, so apps whose package manager doesn't hoist vue-convex can still import it */
function resolveConvexVueEntry(entry: 'advanced' | 'index' | 'storage'): string {
  const id = entry === 'index' ? 'vue-convex' : `vue-convex/${entry}`
  try {
    return resolveModule(id, { url: new URL(import.meta.url) })
  }
  catch {
    return id
  }
}

/**
 * The alias points at a re-export so the app never resolves `vue-convex` itself.
 * TypeScript reaches it through the alias in `paths`, which picks the `.d.ts` sibling.
 */
function addConvexVueAlias(nuxt: Nuxt, alias: string, entry: 'advanced' | 'index' | 'storage', name: string = entry): string {
  const contents = `// Auto-generated by nuxt-convex\nexport * from '${resolveConvexVueEntry(entry)}'\n`
  const template = addTemplate({ filename: `convex/${name}.mjs`, getContents: () => contents, write: true })
  addTemplate({ filename: `convex/${name}.d.ts`, getContents: () => contents, write: true })

  if (alias)
    nuxt.options.alias[alias] = template.dst
  return template.dst
}

function setupConvexExports(nuxt: Nuxt, resolve: Resolve): void {
  addConvexVueAlias(nuxt, '#convex', 'index')
  addImports(rootAutoImports.map(name => ({ name, from: '#convex' })))

  addComponent({ name: 'ConvexQuery', export: 'default', filePath: resolve('./runtime/components/ConvexQuery') })
  addComponent({ name: 'ConvexPaginatedQuery', export: 'default', filePath: resolve('./runtime/components/ConvexPaginatedQuery') })
  for (const name of ['ConvexAuthenticated', 'ConvexUnauthenticated', 'ConvexAuthLoading'] as const)
    addComponent({ name, export: name, filePath: resolve('./runtime/components/ConvexAuth') })
}

function setupConvexAdvanced(nuxt: Nuxt): void {
  nuxt.options.alias['#nuxt-convex/advanced-runtime'] = addConvexVueAlias(nuxt, '#convex/advanced', 'advanced')
}

function setupConvexStorage(nuxt: Nuxt): void {
  nuxt.options.alias['#nuxt-convex/storage-runtime'] = addConvexVueAlias(nuxt, '#convex/storage', 'storage')
  addImports(storageAutoImports.map(name => ({ name, from: '#convex/storage' })))
}

function setupStorageRuntimeFallback(nuxt: Nuxt): void {
  nuxt.options.alias['#nuxt-convex/storage-runtime'] = addConvexVueAlias(nuxt, '', 'storage', 'storage-runtime')
}

function setupConvexApiAlias(nuxt: Nuxt, convexRoot: ResolvedConvexRoot): void {
  const generatedDir = convexRoot.generatedDir
  if (nuxt.options.dev && !existsSync(generatedDir))
    log.warn(`Missing ${formatProjectRelativePath(nuxt, generatedDir)}. Run \`npx convex dev\` to generate types.`)

  // TypeScript resolves it through `paths`, straight to Convex's generated `api.d.ts`
  nuxt.options.alias['#convex/api'] = join(generatedDir, 'api')
}

function setupInternalStorageRefsRuntime(nuxt: Nuxt, convexRoot: ResolvedConvexRoot): void {
  const generatedApiImport = toImportPath(join(nuxt.options.buildDir, 'convex'), join(convexRoot.generatedDir, 'api'))
  const template = addTemplate({
    filename: 'convex/storage-refs-runtime.mjs',
    getContents: () => `// Auto-generated by nuxt-convex
import { api } from '${generatedApiImport}'

export function getStorageRefs() {
  return api?._hub?.storage
}
`,
    write: true,
  })

  nuxt.options.alias['#nuxt-convex/storage-refs-runtime'] = template.dst
}

function setupServer(nuxt: Nuxt, resolve: Resolve, config: ResolvedConvexOptions): void {
  const serverUtils = resolve('./runtime/server/utils/convex')

  addServerHandler({ middleware: true, handler: resolve('./runtime/server/middleware/convex-token') })
  if (config.runtime.auth.proxy)
    addServerHandler({ route: `${config.runtime.auth.basePath.replace(/\/$/, '')}/**`, handler: resolve('./runtime/server/routes/auth-proxy') })

  addServerImports(serverAutoImports.map(name => ({ name, from: serverUtils })))
  // Server-only, so it stays out of the app's aliases
  nuxt.options.nitro.alias ||= {}
  nuxt.options.nitro.alias['#convex/server'] = serverUtils
  // Types only: the app tsconfig type-checks server routes through Nitro's typed route map
  nuxt.hook('prepare:types', ({ tsConfig, sharedTsConfig }) => {
    for (const config of [tsConfig, sharedTsConfig]) {
      if (!config)
        continue
      config.compilerOptions ||= {}
      config.compilerOptions.paths ||= {}
      config.compilerOptions.paths['#convex/server'] = [serverUtils]
    }
  })

  const isNitro2 = (getNitroVersion(nuxt) ?? 2) === 2
  addTypeTemplate({
    filename: 'types/convex-server-hooks.d.ts',
    getContents: () => `// Auto-generated by nuxt-convex
import type { ConvexServerEvent, ConvexTokenContext } from '${serverUtils}'

type ConvexTokenHook = (event: ConvexServerEvent, ctx: ConvexTokenContext) => void | Promise<void>
type ConvexTokenGetter = () => Promise<string | null>

declare module 'nuxt/schema' {
  interface NuxtServerHooks {
    'convex:token': ConvexTokenHook
  }
  interface RequestEventContext {
    $convexToken?: ConvexTokenGetter
  }
}
${isNitro2
  ? `
declare module 'nitropack/types' {
  interface NitroRuntimeHooks {
    'convex:token': ConvexTokenHook
  }
}

declare module 'h3' {
  interface H3EventContext {
    $convexToken?: ConvexTokenGetter
  }
}
`
  : ''}
export {}
`,
  }, { nitro: true, nuxt: true })
}

async function scaffoldStorageFunctions(nuxt: Nuxt, convexRoot: ResolvedConvexRoot): Promise<void> {
  const storageDir = join(convexRoot.writeDir, '_hub')
  const storagePath = join(storageDir, 'storage.ts')

  if (existsSync(storagePath)) {
    if (isUnguardedStorageScaffold(await readFile(storagePath, 'utf8')))
      log.warn(`${formatProjectRelativePath(nuxt, storagePath)} lets anyone upload and delete files. Delete it to regenerate it with auth checks.`)
    return
  }

  if (convexRoot.fallsBackToProjectWrite)
    log.warn(`Reading Convex files from ${formatProjectRelativePath(nuxt, convexRoot.readDir)} and scaffolding ${formatProjectRelativePath(nuxt, storagePath)} instead because the resolved layer is not writable. Set \`convex.dir\` to a writable project path to override this.`)

  await mkdir(storageDir, { recursive: true })
  await writeFile(storagePath, buildStorageFunctions(resolveStorageServerImportPath(convexRoot)))
  log.success(`Created ${formatProjectRelativePath(nuxt, storagePath)}`)
}

/** `npx convex dev` usually starts after `nuxt dev`: pick up its generated API without a restart */
function watchGeneratedDir(nuxt: Nuxt, convexRoot: ResolvedConvexRoot): void {
  if (existsSync(convexRoot.generatedDir) || !existsSync(convexRoot.readDir))
    return

  const watcher = watch(convexRoot.readDir, async (_, filename) => {
    if (filename !== '_generated' || !existsSync(convexRoot.generatedDir))
      return
    watcher.close()
    await updateTemplates({ filter: template => template.filename.startsWith('convex/') || template.filename.startsWith('types/convex') })
    log.success(`Found ${formatProjectRelativePath(nuxt, convexRoot.generatedDir)}`)
  })
  nuxt.hook('close', () => watcher.close())
}

interface DevToolsLaunchTab {
  name: string
  title: string
  icon?: string
  category?: string
  view: { type: 'launch', description: string, actions: { label: string, src?: string }[] }
}

function addConvexDevTools(nuxt: Nuxt, config: ResolvedConvexOptions): void {
  const dashboardUrl = resolveDashboardUrl({ url: config.runtime.url, deployment: config.deployment })
  if (!dashboardUrl)
    return

  // The dashboard refuses to be framed (`frame-ancestors 'self'`), so the tab links out
  nuxt.hook('devtools:customTabs', (tabs: DevToolsLaunchTab[]) => {
    tabs.push({
      category: 'server',
      name: 'convex',
      title: 'Convex',
      icon: 'i-simple-icons-convex',
      view: {
        type: 'launch',
        description: `Data, functions and logs of ${config.deployment || config.runtime.url}.`,
        actions: [{ label: 'Open Convex dashboard', src: dashboardUrl }],
      },
    })
  })
}
