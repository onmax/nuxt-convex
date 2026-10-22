import { paginationOptsValidator } from 'convex/server'
import { ConvexError, v } from 'convex/values'
import { api } from './_generated/api'
import { action, mutation, query } from './_generated/server'
import { getUserId, requireUserId } from './identity'

// The user always comes from the auth token, never from arguments the client controls

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx)
    if (!userId)
      return []
    return await ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).order('desc').collect()
  },
})

export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const userId = await getUserId(ctx)
    if (!userId)
      return { page: [], isDone: true, continueCursor: '' }
    return await ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).order('desc').paginate(paginationOpts)
  },
})

export const add = mutation({
  args: { title: v.string() },
  handler: async (ctx, { title }) => {
    const userId = await requireUserId(ctx)
    return await ctx.db.insert('tasks', { title, userId, createdAt: Date.now() })
  },
})

export const remove = mutation({
  args: { id: v.id('tasks') },
  handler: async (ctx, { id }) => {
    const userId = await requireUserId(ctx)
    const task = await ctx.db.get(id)
    if (task?.userId !== userId)
      throw new ConvexError('Task not found')
    await ctx.db.delete(id)
  },
})

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)
    const tasks = await ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).collect()

    await Promise.all(tasks.map(task => ctx.db.delete(task._id)))
    return tasks.length
  },
})

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx)
    const tasks = userId ? await ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).collect() : []
    return { total: tasks.length, oldest: tasks.at(-1)?.createdAt ?? null, newest: tasks.at(0)?.createdAt ?? null }
  },
})

export const summarize = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    // Actions forward the caller's identity to the functions they run
    const s = await ctx.runQuery(api.tasks.stats, {})
    return `You have ${s.total} task${s.total === 1 ? '' : 's'}. ${s.newest ? `Latest created ${new Date(s.newest).toLocaleString()}.` : 'None yet.'}`
  },
})

export const seed = mutation({
  args: { count: v.optional(v.number()) },
  handler: async (ctx, { count = 25 }) => {
    const userId = await requireUserId(ctx)
    for (let i = 0; i < count; i++) {
      await ctx.db.insert('tasks', { title: `Sample task #${i + 1}`, userId, createdAt: Date.now() - i * 60000 })
    }
    return count
  },
})
