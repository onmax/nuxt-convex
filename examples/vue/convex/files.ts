import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'

// The storage functions `convexVueStorage` needs: generateUploadUrl, getUrl and remove.
// Like tasks.ts, they skip auth for the demo. In a real app, require a signed-in user and
// check that they own the file before returning its URL or deleting it.

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})

export const getUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId)
  },
})

export const remove = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, { storageId }) => {
    const file = await ctx.db.query('files').withIndex('by_storage_id', q => q.eq('storageId', storageId)).unique()
    if (file)
      await ctx.db.delete(file._id)
    await ctx.storage.delete(storageId)
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('files').order('desc').take(24)
  },
})

export const save = mutation({
  args: { storageId: v.id('_storage'), name: v.string(), type: v.string(), size: v.number() },
  handler: async (ctx, file) => {
    const metadata = await ctx.db.system.get(file.storageId)
    if (!metadata)
      throw new ConvexError({ code: 'NOT_FOUND', message: 'The upload did not finish.' })
    return await ctx.db.insert('files', { ...file, createdAt: Date.now() })
  },
})
