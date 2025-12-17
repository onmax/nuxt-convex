import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl()
})

export const saveFile = mutation({
  args: { storageId: v.id('_storage'), name: v.string(), type: v.string(), userId: v.string() },
  handler: async (ctx, { storageId, name, type, userId }) => {
    const url = await ctx.storage.getUrl(storageId) ?? undefined
    return await ctx.db.insert('uploads', { storageId, name, type, url, userId, createdAt: Date.now() })
  },
})

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db.query('uploads').withIndex('by_user', q => q.eq('userId', userId)).order('desc').collect()
  },
})

export const getUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId)
  },
})

export const remove = mutation({
  args: { id: v.id('uploads') },
  handler: async (ctx, { id }) => {
    const upload = await ctx.db.get(id)
    if (upload) {
      await ctx.storage.delete(upload.storageId)
      await ctx.db.delete(id)
    }
  },
})
