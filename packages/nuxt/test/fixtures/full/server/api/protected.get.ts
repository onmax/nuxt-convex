export default defineEventHandler(async (event) => {
  return { token: await requireConvexAuth(event) }
})
