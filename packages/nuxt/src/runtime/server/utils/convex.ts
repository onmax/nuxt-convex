import type { FunctionReference, FunctionReturnType, OptionalRestArgs } from 'convex/server'
import type { NuxtError } from 'nuxt/server'
import type { ConvexPublicRuntimeConfig } from '../../../types/config'
import type { ConvexServerEvent } from '../internal/token'
import { ConvexHttpClient } from 'convex/browser'
import { createError, isNuxtError, useRuntimeConfig } from 'nuxt/server'
import { getConvexTokenGetter } from '../internal/token'

export type { ConvexServerEvent, ConvexTokenContext } from '../internal/token'

export interface ConvexServer {
  query: <Query extends FunctionReference<'query'>>(query: Query, ...args: OptionalRestArgs<Query>) => Promise<FunctionReturnType<Query>>
  mutation: <Mutation extends FunctionReference<'mutation'>>(mutation: Mutation, ...args: OptionalRestArgs<Mutation>) => Promise<FunctionReturnType<Mutation>>
  action: <Action extends FunctionReference<'action'>>(action: Action, ...args: OptionalRestArgs<Action>) => Promise<FunctionReturnType<Action>>
  /** The request's `ConvexHttpClient`, authenticated with its token. Its errors are not mapped to H3 errors. */
  getClient: () => Promise<ConvexHttpClient>
  getToken: () => Promise<string | null>
}

const servers = new WeakMap<object, ConvexServer>()

/** The Convex JWT of the request's user, or `null`. Resolved once per request. */
export function getConvexToken(event: ConvexServerEvent): Promise<string | null> {
  return getConvexTokenGetter(event)()
}

/** Like {@link getConvexToken}, but throws a 401 for anonymous requests */
export async function requireConvexAuth(event: ConvexServerEvent): Promise<string> {
  const token = await getConvexToken(event)
  if (!token)
    throw createError({ status: 401, statusText: 'Unauthorized', message: 'Convex authentication required' })
  return token
}

/**
 * Call Convex as the request's user. One client per request; failures are thrown as H3 errors
 * (see {@link toConvexH3Error}).
 */
export function useConvexServer(event: ConvexServerEvent): ConvexServer {
  const cached = servers.get(event.context)
  if (cached)
    return cached

  let client: Promise<ConvexHttpClient> | undefined
  const getClient = (): Promise<ConvexHttpClient> => client ??= createClient(event)
  const call = (kind: 'query' | 'mutation' | 'action') => async (fn: FunctionReference<any>, ...args: [any?]) => {
    const convex = await getClient()
    try {
      return await (convex[kind] as (fn: FunctionReference<any>, ...args: [any?]) => Promise<any>)(fn, ...args)
    }
    catch (error) {
      throw toConvexH3Error(error)
    }
  }

  const server: ConvexServer = {
    query: call('query'),
    mutation: call('mutation'),
    action: call('action'),
    getClient,
    getToken: () => getConvexToken(event),
  }
  servers.set(event.context, server)
  return server
}

export function serverConvexQuery<Query extends FunctionReference<'query'>>(event: ConvexServerEvent, query: Query, ...args: OptionalRestArgs<Query>): Promise<FunctionReturnType<Query>> {
  return useConvexServer(event).query(query, ...args)
}

export function serverConvexMutation<Mutation extends FunctionReference<'mutation'>>(event: ConvexServerEvent, mutation: Mutation, ...args: OptionalRestArgs<Mutation>): Promise<FunctionReturnType<Mutation>> {
  return useConvexServer(event).mutation(mutation, ...args)
}

export function serverConvexAction<Action extends FunctionReference<'action'>>(event: ConvexServerEvent, action: Action, ...args: OptionalRestArgs<Action>): Promise<FunctionReturnType<Action>> {
  return useConvexServer(event).action(action, ...args)
}

/**
 * Map a Convex failure to an H3 error.
 * A `ConvexError` becomes a 400 carrying its `data` (or `data.status` when it's a 4xx/5xx number);
 * anything else becomes a 500 whose message doesn't leak Convex internals. The original error is the `cause`.
 */
export function toConvexH3Error(error: unknown): NuxtError {
  if (isNuxtError(error))
    return error as NuxtError

  if (error instanceof Error && error.name === 'ConvexError') {
    const data = (error as Error & { data?: unknown }).data
    const record = data && typeof data === 'object' ? data as Record<string, unknown> : undefined
    const status = typeof record?.status === 'number' && record.status >= 400 && record.status < 600 ? record.status : 400
    const message = typeof data === 'string' ? data : typeof record?.message === 'string' ? record.message : 'Convex function failed'
    return createError({ status, message, data, cause: error })
  }

  return createError({ status: 500, message: 'Convex request failed', cause: error })
}

async function createClient(event: ConvexServerEvent): Promise<ConvexHttpClient> {
  const config = useRuntimeConfig().public.convex as ConvexPublicRuntimeConfig | undefined
  if (!config?.url)
    throw createError({ status: 500, message: '[nuxt-convex] Convex URL is not configured. Set CONVEX_URL or NUXT_PUBLIC_CONVEX_URL.' })

  const client = new ConvexHttpClient(config.url, {
    skipConvexDeploymentUrlCheck: config.clientOptions?.skipConvexDeploymentUrlCheck,
    logger: config.clientOptions?.logger,
  })
  const token = await getConvexToken(event)
  if (token)
    client.setAuth(token)
  return client
}
