export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const convex = config.public.convex as {
    r2?: boolean
    ssr?: boolean
    storage?: boolean
    url?: string
  } | undefined

  return {
    convex: {
      r2: !!convex?.r2,
      ssr: convex?.ssr ?? true,
      storage: !!convex?.storage,
      url: convex?.url ?? '',
    },
  }
})
