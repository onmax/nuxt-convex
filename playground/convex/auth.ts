/**
 * Better Auth CRUD functions for Convex.
 * These are called by the nuxt-better-auth HTTP adapter.
 */
import { createApi } from '@convex-dev/better-auth'
import schema from './schema'

export const { create, findOne, findMany, updateOne, updateMany, deleteOne, deleteMany } = createApi(schema, () => ({}))
