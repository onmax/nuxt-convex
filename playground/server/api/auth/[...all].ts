import { getMethod, getRequestHeaders, getRequestURL, isMethod, readRawBody } from 'h3'

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

  return fetch(target, {
    method: getMethod(event),
    headers,
    body: isMethod(event, ['PATCH', 'POST', 'PUT', 'DELETE']) ? await readRawBody(event, false) : undefined,
    redirect: 'manual',
  })
})
