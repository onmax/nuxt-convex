import { appendResponseHeader, getMethod, getRequestHeaders, getRequestURL, isMethod, readRawBody, setResponseStatus } from 'h3'

function toConvexSiteUrl(convexUrl: string): string {
  const url = new URL(convexUrl)
  url.hostname = url.hostname.replace('.convex.cloud', '.convex.site')
  return url.toString()
}

export default defineEventHandler(async (event) => {
  const requestUrl = getRequestURL(event)
  const convexUrl = (useRuntimeConfig().public.convex as { url?: string })?.url

  if (!convexUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing public Convex URL',
    })
  }

  const targetUrl = new URL(`${requestUrl.pathname}${requestUrl.search}`, toConvexSiteUrl(convexUrl))
  const target = targetUrl.toString()
  const headers = new Headers(getRequestHeaders(event))

  headers.delete('content-length')
  headers.delete('host')
  headers.set('origin', targetUrl.origin)
  headers.set('referer', `${targetUrl.origin}/`)

  const response = await fetch(target, {
    method: getMethod(event),
    headers,
    body: isMethod(event, ['PATCH', 'POST', 'PUT', 'DELETE']) ? await readRawBody(event, false) : undefined,
    redirect: 'manual',
  })

  setResponseStatus(event, response.status, response.statusText)

  for (const [key, value] of response.headers.entries()) {
    if (key === 'content-encoding' || key === 'content-length' || key === 'transfer-encoding')
      continue

    appendResponseHeader(event, key, value)
  }

  const responseBody = await response.arrayBuffer()
  return responseBody.byteLength > 0 ? new Uint8Array(responseBody) : null
})
