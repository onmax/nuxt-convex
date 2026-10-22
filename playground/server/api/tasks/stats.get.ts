import { api } from '#convex/api'

// Runs on the server as the signed-in user: the module turns the session cookie into a Convex token
export default defineEventHandler(async (event) => {
  await requireConvexAuth(event)
  return await serverConvexQuery(event, api.tasks.stats)
})
