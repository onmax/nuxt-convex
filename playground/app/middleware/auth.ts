// Redirects unauthenticated users to index
export default defineNuxtRouteMiddleware(async () => {
  const { user, waitForSession } = useUserSession()
  await waitForSession()

  if (!user.value)
    return navigateTo('/')
})
