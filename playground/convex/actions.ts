import { v } from 'convex/values'
import { action } from './_generated/server'

export const echo = action({
  args: { message: v.string(), delay: v.optional(v.number()) },
  handler: async (_ctx, { message, delay = 1000 }) => {
    await new Promise(r => setTimeout(r, delay))
    return `Echo: ${message} (delayed ${delay}ms)`
  },
})
