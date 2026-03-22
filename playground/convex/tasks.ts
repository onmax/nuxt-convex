import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'
import { api } from './_generated/api'
import { action, mutation, query } from './_generated/server'

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).order('desc').collect()
  },
})

export const listPaginated = query({
  args: { userId: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, { userId, paginationOpts }) => {
    return await ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).order('desc').paginate(paginationOpts)
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

export const clearAll = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tasks = await ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).collect()

    await Promise.all(tasks.map(task => ctx.db.delete(task._id)))
    return tasks.length
  },
})

export const stats = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const tasks = await ctx.db.query('tasks').withIndex('by_user', q => q.eq('userId', userId)).collect()
    return { total: tasks.length, oldest: tasks.at(-1)?.createdAt ?? null, newest: tasks.at(0)?.createdAt ?? null }
  },
})

export const summarize = action({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const s = await ctx.runQuery(api.tasks.stats, { userId })
    return `You have ${s.total} task${s.total === 1 ? '' : 's'}. ${s.newest ? `Latest created ${new Date(s.newest).toLocaleString()}.` : 'None yet.'}`
  },
})

export const seed = mutation({
  args: { userId: v.string(), count: v.optional(v.number()) },
  handler: async (ctx, { userId, count = 25 }) => {
    for (let i = 0; i < count; i++) {
      await ctx.db.insert('tasks', { title: `Sample task #${i + 1}`, userId, createdAt: Date.now() - i * 60000 })
    }
    return count
  },
})
