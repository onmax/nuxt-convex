export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    providerCheck: config.public.providerCheck,
  }
})
