import type { ConvexPublicRuntimeConfig } from '../../../types/config'
import { createError, defineEventHandler, getRequestIP, useRuntimeConfig } from 'nuxt/server'
import { resolveConvexSiteUrl } from '../../utils/site-url'

const DROPPED_REQUEST_HEADERS = ['connection', 'content-length', 'expect', 'host', 'keep-alive', 'proxy-connection', 'te', 'trailer', 'transfer-encoding', 'upgrade']
const DROPPED_RESPONSE_HEADERS = ['connection', 'content-encoding', 'content-length', 'keep-alive', 'transfer-encoding']

/** Forwards Better Auth requests to the Convex deployment, where `@convex-dev/better-auth` serves them */
export default defineEventHandler(async (event) => {
  // SAFETY: the module writes `public.convex` from resolveConvexOptions(); it's absent only outside a nuxt-convex app.
  const siteUrl = resolveConvexSiteUrl(useRuntimeConfig().public.convex as ConvexPublicRuntimeConfig | undefined)
  if (!siteUrl)
    throw createError({ status: 500, message: '[nuxt-convex] Set CONVEX_SITE_URL (or convex.siteUrl) to proxy auth requests to Convex.' })

  const { req, url } = event
  const headers = new Headers(req.headers)
  for (const name of DROPPED_REQUEST_HEADERS)
    headers.delete(name)
  // Better Auth builds callback URLs from these, so they must describe this app, not whatever the client sent
  const proto = url.protocol.slice(0, -1)
  headers.set('x-forwarded-host', url.host)
  headers.set('x-forwarded-proto', proto)
  headers.set('x-better-auth-forwarded-host', url.host)
  headers.set('x-better-auth-forwarded-proto', proto)
  if (!headers.has('x-forwarded-for')) {
    const ip = getRequestIP(event)
    if (ip)
      headers.set('x-forwarded-for', ip)
  }

  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer()
  const response = await fetch(new URL(url.pathname + url.search, siteUrl), {
    method: req.method,
    headers,
    body: body?.byteLength ? body : undefined,
    redirect: 'manual',
  }).catch((cause: unknown) => {
    throw createError({ status: 502, statusText: 'Bad Gateway', message: `[nuxt-convex] Could not reach ${siteUrl}`, cause })
  })

  const responseHeaders = new Headers(response.headers)
  for (const name of DROPPED_RESPONSE_HEADERS)
    responseHeaders.delete(name)
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: responseHeaders })
})
