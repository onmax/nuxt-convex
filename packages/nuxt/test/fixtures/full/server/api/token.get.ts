import { getConvexToken } from '#convex/server'

export default defineEventHandler(async (event) => {
  const [first, second] = await Promise.all([getConvexToken(event), event.context.$convexToken?.()])
  return { token: first, same: first === second }
})
