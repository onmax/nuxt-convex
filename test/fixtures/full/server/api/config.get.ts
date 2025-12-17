export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const convex = config.public.convex as { url?: string } | undefined

  return {
    url: convex?.url,
    hasUrl: !!convex?.url,
  }
})
