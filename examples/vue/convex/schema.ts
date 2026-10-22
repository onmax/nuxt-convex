import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    isCompleted: v.boolean(),
    createdAt: v.number(),
  }),
  files: defineTable({
    storageId: v.id('_storage'),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    createdAt: v.number(),
  }).index('by_storage_id', ['storageId']),
})
