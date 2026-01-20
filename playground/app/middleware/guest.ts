// Redirects authenticated users to dashboard
export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()
  if (user.value)
    return navigateTo('/dashboard')
})
