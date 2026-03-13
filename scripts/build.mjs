import { execFileSync } from 'node:child_process'

function run(args) {
  execFileSync('pnpm', args, {
    stdio: 'inherit',
    env: process.env,
  })
}

run(['--filter', '@onmax/convex-vue', 'build'])
run(['--filter', 'nuxt-convex', 'build'])

if (process.env.WORKERS_CI) {
  run(['--dir', 'playground', 'build'])
}
