// Stands in for the nuxt-convex Nitro plugin: the token comes from a test header instead of a session.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const token = getRequestHeader(event, 'x-test-token') ?? null
    event.context.$convexToken = async () => token
  })
})
