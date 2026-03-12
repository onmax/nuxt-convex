export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const convex = config.public.convex as { url?: string, r2?: boolean } | undefined

  return {
    r2: !!convex?.r2,
  }
})
