// Started from the nuxt-convex scaffold, then extended with an `uploads` table that records the owner
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { ConvexError, v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { getUserId, requireUserId } from '../identity'

async function requireOwnUpload(ctx: MutationCtx, id: Id<'uploads'>): Promise<Doc<'uploads'>> {
  const userId = await requireUserId(ctx)
  const upload = await ctx.db.get(id)
  if (upload?.userId !== userId)
    throw new ConvexError('File not found')
  return upload
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx)
    return await ctx.storage.generateUploadUrl()
  },
})

export const saveFile = mutation({
  args: { storageId: v.id('_storage'), name: v.string(), type: v.string() },
  handler: async (ctx, { storageId, name, type }) => {
    const userId = await requireUserId(ctx)
    const url = await ctx.storage.getUrl(storageId) ?? undefined
    return await ctx.db.insert('uploads', { storageId, name, type, url, userId, createdAt: Date.now() })
  },
})

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx)
    if (!userId)
      return []
    return await ctx.db.query('uploads').withIndex('by_user', q => q.eq('userId', userId)).order('desc').collect()
  },
})

export const getUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, { storageId }) => {
    const userId = await requireUserId(ctx)
    const upload = await ctx.db.query('uploads').filter(q => q.eq(q.field('storageId'), storageId)).first()
    if (upload?.userId !== userId)
      return null
    return await ctx.storage.getUrl(storageId)
  },
})

export const remove = mutation({
  args: { id: v.id('uploads') },
  handler: async (ctx, { id }) => {
    const upload = await requireOwnUpload(ctx, id)
    await ctx.storage.delete(upload.storageId)
    await ctx.db.delete(id)
  },
})

export const removeByStorageId = mutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, { storageId }) => {
    const userId = await requireUserId(ctx)
    const upload = await ctx.db.query('uploads').filter(q => q.eq(q.field('storageId'), storageId)).first()
    if (upload?.userId !== userId)
      throw new ConvexError('File not found')

    await ctx.db.delete(upload._id)
    await ctx.storage.delete(storageId)
  },
})
