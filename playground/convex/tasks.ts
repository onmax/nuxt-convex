import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).order('desc').collect()
  },
})

export const add = mutation({
  args: { title: v.string(), userId: v.string() },
  handler: async (ctx, { title, userId }) => {
    return await ctx.db.insert('tasks', { title, userId, createdAt: Date.now() })
  },
})

export const remove = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
