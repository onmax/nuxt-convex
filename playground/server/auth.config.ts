import { defineServerAuth } from '@nuxtjs/better-auth/config'

// Unused while `auth.clientOnly` is on: Better Auth runs inside Convex (convex/auth.ts).
// @nuxtjs/better-auth recreates this file when it's missing, so it stays.
export default defineServerAuth({})
