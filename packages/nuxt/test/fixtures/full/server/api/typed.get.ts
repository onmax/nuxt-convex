import type { FunctionReference } from 'convex/server'
import type { ConvexTokenContext } from '#convex/server'
import { api } from '#convex/api'
import { getConvexToken } from '#convex/server'

// Never requested: it only has to typecheck
export default defineEventHandler(async (event) => {
  const ctx: ConvexTokenContext = { headers: new Headers() }
  const token: string | null = await getConvexToken(event)
  const getter: (() => Promise<string | null>) | undefined = event.context.$convexToken
  return { ctx, token, getter: typeof getter, list: await serverConvexQuery(event, api.test!.list as FunctionReference<'query'>) }
})
