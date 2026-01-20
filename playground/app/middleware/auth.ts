// Redirects unauthenticated users to index
export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()
  if (!user.value)
    return navigateTo('/')
})
