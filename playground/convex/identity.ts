import type { Auth } from 'convex/server'
import { ConvexError } from 'convex/values'

/** The Better Auth user id, which @convex-dev/better-auth puts in the JWT subject */
export async function getUserId(ctx: { auth: Auth }): Promise<string | null> {
  return (await ctx.auth.getUserIdentity())?.subject ?? null
}

export async function requireUserId(ctx: { auth: Auth }): Promise<string> {
  const userId = await getUserId(ctx)
  if (!userId)
    throw new ConvexError('Sign in first')
  return userId
}
