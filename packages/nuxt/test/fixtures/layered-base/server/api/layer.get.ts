import { layer } from '#convex/api'

export default defineEventHandler(() => ({
  layer,
  url: (useRuntimeConfig().public.convex as { url: string }).url,
}))
