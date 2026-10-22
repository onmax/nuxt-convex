// Speaks just enough of Convex's HTTP query protocol (`POST /api/query`) for SSR.
export default defineEventHandler(async (event) => {
  const { path } = await readBody<{ path: string }>(event)
  const token = getRequestHeader(event, 'authorization')?.replace('Bearer ', '')

  switch (path) {
    case 'tasks:list':
      return { status: 'success', value: [{ text: 'from-ssr' }], logLines: [] }
    case 'tasks:whoami':
      return { status: 'success', value: token ? `user-of-${token.length}-char-token` : 'anonymous', logLines: [] }
    case 'tasks:forbidden':
      return { status: 'error', errorMessage: 'Forbidden', errorData: { code: 'FORBIDDEN' }, logLines: [] }
    case 'tasks:paginated':
      return { status: 'success', value: { page: [{ text: 'page-item' }], isDone: true, continueCursor: 'end' }, logLines: [] }
    default:
      return { status: 'error', errorMessage: `Unknown query ${path}`, logLines: [] }
  }
})
