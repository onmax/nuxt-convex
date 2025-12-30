import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    userId: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_user', ['userId']),
  uploads: defineTable({
    storageId: v.id('_storage'),
    name: v.string(),
    type: v.string(),
    url: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.number(),
  }).index('by_user', ['userId']),
})
