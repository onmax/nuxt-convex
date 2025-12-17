import { mutation } from './_generated/server'

export const purgeOldData = mutation({
  handler: async (ctx) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000 // 24h ago

    // Delete old tasks
    const oldTasks = await ctx.db.query('tasks').filter(q => q.lt(q.field('createdAt'), cutoff)).collect()
    for (const task of oldTasks) await ctx.db.delete(task._id)

    // Delete old uploads + storage
    const oldUploads = await ctx.db.query('uploads').filter(q => q.lt(q.field('createdAt'), cutoff)).collect()
    for (const upload of oldUploads) {
      await ctx.storage.delete(upload.storageId)
      await ctx.db.delete(upload._id)
    }

    return { deletedTasks: oldTasks.length, deletedUploads: oldUploads.length }
  },
})
