export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const convex = config.public.convex as {
    dir?: string
    r2?: boolean
    server?: boolean
    storage?: boolean
    url?: string
  } | undefined

  return {
    convex,
  }
})
