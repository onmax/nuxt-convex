export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server)
    return

  const { user, ready, fetchSession } = useUserSession()

  if (!ready.value)
    await fetchSession({ force: true })

  if (user.value)
    return navigateTo('/dashboard')
})
