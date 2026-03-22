export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server)
    return

  const { user, ready } = useUserSession()

  if (ready.value && user.value)
    return navigateTo('/dashboard')
})
