import { useServerHooks } from 'nuxt/server'

export default defineNitroPlugin(() => {
  useServerHooks().hook('convex:token', (_event, ctx) => {
    const token = ctx.headers.get('x-test-token')
    if (token)
      ctx.token = token === 'anonymous' ? null : token
  })
})
