import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  testItems: defineTable({ name: v.string(), value: v.number() }),
})
