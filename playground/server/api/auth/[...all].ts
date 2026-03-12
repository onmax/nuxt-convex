import { getProxyRequestHeaders, getRequestURL, sendProxy } from 'h3'

function toConvexSiteUrl(convexUrl: string): string {
  const url = new URL(convexUrl)
  url.hostname = url.hostname.replace('.convex.cloud', '.convex.site')
  return url.toString()
}

export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event)
  const convexUrl = (useRuntimeConfig().public.convex as { url?: string })?.url

  if (!convexUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing public Convex URL',
    })
  }

  const target = new URL(`${requestUrl.pathname}${requestUrl.search}`, toConvexSiteUrl(convexUrl)).toString()

  return sendProxy(event, target, {
    headers: getProxyRequestHeaders(event, { host: false }),
    fetchOptions: { redirect: 'manual' },
  })
})
