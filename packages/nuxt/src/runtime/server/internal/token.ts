import type { NuxtRequestEvent, RequestEvent } from 'nuxt/server'
import type { ConvexPublicRuntimeConfig } from '../../../types/config'
import { getRequestHeaders, serverFetch, useRuntimeConfig, useServerHooks } from 'nuxt/server'

/** An h3 event (Nitro handlers) or a portable `nuxt/server` event */
export type ConvexServerEvent = NuxtRequestEvent | RequestEvent

export type ConvexTokenGetter = () => Promise<string | null>

export interface ConvexTokenContext {
  /** Set a JWT, or `null` for anonymous, to skip the built-in provider */
  token?: string | null
  /** Headers of the incoming request */
  headers: Headers
}

// Better Auth names it `<prefix>.session_token`, with `__Secure-` on HTTPS
const SESSION_COOKIE_RE = /(?:^|;\s*)[\w.-]*session_token=/

type AnyEvent = any

export function getConvexTokenGetter(event: ConvexServerEvent): ConvexTokenGetter {
  const context = event.context as { $convexToken?: ConvexTokenGetter }
  return context.$convexToken ??= createConvexTokenGetter(event)
}

/** Resolves the request's Convex token once, however many times it's called */
export function createConvexTokenGetter(event: ConvexServerEvent): ConvexTokenGetter {
  let token: Promise<string | null> | undefined
  return () => token ??= resolveConvexToken(event).then((value) => {
    if (value)
      markResponsePrivate(event)
    return value
  })
}

async function resolveConvexToken(event: ConvexServerEvent): Promise<string | null> {
  const headers = new Headers(getRequestHeaders(event as AnyEvent))
  const ctx: ConvexTokenContext = { token: undefined, headers }
  await (useServerHooks() as AnyEvent).callHook('convex:token', event, ctx)
  if (ctx.token !== undefined)
    return ctx.token || null

  const auth = (useRuntimeConfig().public.convex as ConvexPublicRuntimeConfig | undefined)?.auth
  if (auth?.provider === 'better-auth')
    return fetchBetterAuthToken(event, headers, auth.basePath)
  return null
}

async function fetchBetterAuthToken(event: ConvexServerEvent, headers: Headers, basePath: string): Promise<string | null> {
  // Skip the round trip for anonymous visitors
  if (!SESSION_COOKIE_RE.test(headers.get('cookie') || ''))
    return null

  try {
    const response = await serverFetch(event as AnyEvent, `${basePath.replace(/\/$/, '')}/convex/token`, { forwardHeaders: ['cookie'] })
    if (response.ok) {
      const data = await response.json() as { token?: unknown } | null
      return typeof data?.token === 'string' ? data.token : null
    }
    if (response.status !== 401 && response.status !== 403)
      console.warn(`[nuxt-convex] Better Auth token request failed with ${response.status}. Rendering anonymously.`)
  }
  catch (error) {
    console.warn('[nuxt-convex] Better Auth token request failed. Rendering anonymously.', error)
  }
  return null
}

/** A response rendered with a user's token must never be stored in a shared cache */
function markResponsePrivate(event: ConvexServerEvent): void {
  const target = event as AnyEvent
  // Portable and h3 v2 events expose web `Headers`, h3 v1 events a node response
  const headers = typeof target.res?.headers?.set === 'function' ? target.res.headers : undefined
  const node = target.node?.res
  try {
    const vary = String(headers ? headers.get('vary') || '' : node?.getHeader('vary') || '')
    const nextVary = /\bcookie\b/i.test(vary) ? vary : vary ? `${vary}, Cookie` : 'Cookie'
    if (headers) {
      headers.set('vary', nextVary)
      headers.set('cache-control', 'private, no-cache')
    }
    else if (node && !node.headersSent) {
      node.setHeader('vary', nextVary)
      node.setHeader('cache-control', 'private, no-cache')
    }
  }
  catch {}
}
