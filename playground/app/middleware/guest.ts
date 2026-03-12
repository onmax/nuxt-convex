// Redirects authenticated users to dashboard
export default defineNuxtRouteMiddleware(async () => {
  const { user, waitForSession } = useUserSession()
  await waitForSession()

  if (user.value)
    return navigateTo('/dashboard')
})
