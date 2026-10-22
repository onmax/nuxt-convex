import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'

// This demo has no sign-in: anyone with the deployment URL can read and change these tasks.
// In a real app, check `ctx.auth.getUserIdentity()` in every function.

const MAX_TITLE_LENGTH = 80

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('tasks').order('desc').take(50)
  },
})

export const add = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const trimmed = title.trim()
    // ConvexError data reaches the client, where `isConvexError(error, code)` matches it
    if (!trimmed)
      throw new ConvexError({ code: 'EMPTY_TITLE', message: 'Write something first.' })
    if (trimmed.length > MAX_TITLE_LENGTH)
      throw new ConvexError({ code: 'TITLE_TOO_LONG', message: `Keep it under ${MAX_TITLE_LENGTH} characters.` })

    return await ctx.db.insert('tasks', { title: trimmed, isCompleted: false, createdAt: Date.now() })
  },
})

export const toggle = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, { id }) => {
    const task = await ctx.db.get(id)
    if (!task)
      throw new ConvexError({ code: 'NOT_FOUND', message: 'This task was already removed.' })
    await ctx.db.patch(id, { isCompleted: !task.isCompleted })
  },
})

export const remove = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
