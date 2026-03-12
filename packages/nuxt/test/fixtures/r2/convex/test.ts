import { v } from 'convex/values'
import { action, mutation, query } from './_generated/server'

export const list = query({ args: {}, handler: ctx => ctx.db.query('testItems').collect() })

export const create = mutation({
  args: { name: v.string(), value: v.number() },
  handler: (ctx, { name, value }) => ctx.db.insert('testItems', { name, value }),
})

export const remove = mutation({
  args: { id: v.id('testItems') },
  handler: (ctx, { id }) => ctx.db.delete(id),
})

export const deleteAll = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query('testItems').collect()
    await Promise.all(items.map(item => ctx.db.delete(item._id)))
  },
})

export const echo = action({
  args: { message: v.string() },
  handler: (_, { message }) => ({ echoed: message }),
})
