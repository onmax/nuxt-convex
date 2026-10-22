import { ConvexError } from 'convex/values'

export default defineEventHandler(() => {
  throw toConvexH3Error(new ConvexError({ status: 404, message: 'Task not found', id: 'abc' }))
})
