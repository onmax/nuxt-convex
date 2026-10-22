import { defineEventHandler } from 'nuxt/server'
import { getConvexTokenGetter } from '../internal/token'

// Exposes `event.context.$convexToken()` to the SSR plugin and to server code. It's lazy:
// nothing is fetched until something asks for the token.
export default defineEventHandler((event) => {
  getConvexTokenGetter(event)
})
