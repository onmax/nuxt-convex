import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const playgroundDir = resolve(__dirname, '..')
const ENV_COMMENT_SEPARATOR_RE = /\s+#/

const commands = {
  dev: 'pnpm --filter @onmax/convex-vue build && pnpm --filter nuxt-convex dev:prepare && nuxi dev',
  build: 'pnpm --filter @onmax/convex-vue build && pnpm --filter nuxt-convex build && nuxi build',
}

function findClosingQuote(value, quote) {
  for (let index = 1; index < value.length; index++) {
    if (value[index] === quote && value[index - 1] !== '\\')
      return index
  }

  return -1
}

function parseEnvValue(valueWithComment) {
  if (!valueWithComment)
    return ''

  const quote = valueWithComment[0]
  if (quote === '"' || quote === '\'') {
    const closingQuote = findClosingQuote(valueWithComment, quote)
    if (closingQuote !== -1)
      return valueWithComment.slice(1, closingQuote)
  }

  return valueWithComment.split(ENV_COMMENT_SEPARATOR_RE, 1)[0].trim()
}

function parseEnvFile(path) {
  if (!existsSync(path))
    return {}

  const env = {}

  for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#'))
      continue

    const separator = line.indexOf('=')
    if (separator === -1)
      continue

    const key = line.slice(0, separator).trim()
    const valueWithComment = line.slice(separator + 1).trim()
    const value = parseEnvValue(valueWithComment)

    env[key] = value
  }

  return env
}

const mode = process.argv[2]
const command = commands[mode]

if (!command) {
  console.error(`Unknown playground command: ${mode}`)
  process.exit(1)
}

const env = {
  ...parseEnvFile(resolve(playgroundDir, '.env')),
  ...parseEnvFile(resolve(playgroundDir, '.env.local')),
  ...process.env,
}

const child = spawn(command, {
  cwd: playgroundDir,
  env,
  shell: true,
  stdio: 'inherit',
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
