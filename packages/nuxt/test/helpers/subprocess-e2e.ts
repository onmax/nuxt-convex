import type { FetchOptions } from 'ofetch'
import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import { createServer } from 'node:net'
import { join } from 'node:path'
import process from 'node:process'
import { loadNuxt } from '@nuxt/kit'
import { $fetch } from 'ofetch'
import { joinURL } from 'ufo'
import { afterAll, beforeAll } from 'vitest'

interface SubprocessE2EOptions {
  rootDir: string
  server?: boolean
}

interface LoadedFixtureState {
  aliases: Record<string, string>
  buildDir: string
  outputDir: string
}

interface SubprocessE2EFixture {
  alias: (key: string) => string | undefined
  buildDir: () => string
  fetch: <T>(path: string, requestOptions?: FetchOptions<'json'>) => Promise<T>
}

function assertState<T>(value: T | undefined, message: string): T {
  if (value === undefined)
    throw new Error(message)

  return value
}

async function getFreePort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        server.close()
        reject(new Error('Could not determine a free port'))
        return
      }

      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve(address.port)
      })
    })
  })
}

async function runCommand(command: string, args: string[], options: { cwd: string, env?: NodeJS.ProcessEnv }): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: {
        ...process.env,
        ...options.env,
      },
      stdio: 'inherit',
    })

    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code ?? 'unknown'}`))
    })
  })
}

async function waitForServer(url: string): Promise<void> {
  let lastError: unknown

  for (let index = 0; index < 100; index++) {
    try {
      await $fetch(url, { responseType: 'text' })
      return
    }
    catch (error) {
      lastError = error
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  throw lastError ?? new Error(`Timed out waiting for ${url}`)
}

export function setupSubprocessE2E(options: SubprocessE2EOptions): SubprocessE2EFixture {
  let state: LoadedFixtureState | undefined
  let serverProcess: ReturnType<typeof spawn> | undefined
  let serverUrl: string | undefined

  beforeAll(async () => {
    const nuxt = await loadNuxt({
      cwd: options.rootDir,
      dev: false,
    })

    state = {
      aliases: { ...nuxt.options.alias },
      buildDir: nuxt.options.buildDir,
      outputDir: nuxt.options.nitro?.output?.dir ?? join(options.rootDir, '.output'),
    }

    await nuxt.close()

    await runCommand('pnpm', ['exec', 'nuxi', 'prepare', options.rootDir], {
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'production',
      },
    })

    await runCommand('pnpm', ['exec', 'nuxi', 'build', options.rootDir], {
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'production',
      },
    })

    await access(join(assertState(state, 'Fixture state not initialized').outputDir, 'server/index.mjs'))

    if (options.server !== false) {
      const port = await getFreePort()
      serverUrl = `http://127.0.0.1:${port}/`
      serverProcess = spawn('node', [join(state.outputDir, 'server/index.mjs')], {
        cwd: options.rootDir,
        env: {
          ...process.env,
          HOST: '127.0.0.1',
          PORT: String(port),
          NODE_ENV: 'test',
        },
        stdio: 'inherit',
      })

      serverProcess.once('error', (error) => {
        throw error
      })

      await waitForServer(serverUrl)
    }
  }, 120000)

  afterAll(async () => {
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill('SIGTERM')
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  })

  return {
    alias(key: string) {
      return assertState(state, 'Fixture state is not available').aliases[key]
    },
    buildDir() {
      return assertState(state, 'Fixture state is not available').buildDir
    },
    async fetch<T>(path: string, requestOptions?: FetchOptions<'json'>) {
      return await $fetch<T>(joinURL(assertState(serverUrl, 'Server URL is not available'), path), requestOptions)
    },
  }
}
