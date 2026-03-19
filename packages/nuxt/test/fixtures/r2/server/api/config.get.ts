export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const convex = config.public.convex as {
    r2?: boolean
    server?: boolean
    storage?: boolean
    url?: string
  } | undefined

  return {
    convex: {
      r2: !!convex?.r2,
      server: convex?.server ?? true,
      storage: !!convex?.storage,
      url: convex?.url ?? '',
    },
  }
})
