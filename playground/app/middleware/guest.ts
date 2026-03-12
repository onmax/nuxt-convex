export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server)
    return

  const { user, waitForSession } = useUserSession()
  await waitForSession()

  if (user.value)
    return navigateTo('/dashboard')
})
