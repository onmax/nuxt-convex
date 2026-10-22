import type { FunctionReference } from 'convex/server'
import type { JSONValue, Value } from 'convex/values'
import { getFunctionName } from 'convex/server'
import { ConvexError, convexToJson, jsonToConvex } from 'convex/values'

/** A settled SSR query, serialized with `convexToJson` so `bigint` and `ArrayBuffer` survive. */
export type ConvexHydrationEntry
  = | { v: JSONValue }
    | { e: { message: string, data?: JSONValue } }

export interface ConvexHydrationAdapter {
  /** Server: record a settled query. */
  set: (key: string, entry: ConvexHydrationEntry) => void
  /** Client: read a settled query. Only called while `isHydrating()` is true. */
  get: (key: string) => ConvexHydrationEntry | undefined
  isHydrating: () => boolean
}

export type Settled = { value: any } | { error: Error }

export function queryKey(query: FunctionReference<'query'>, args: Record<string, unknown>): string {
  return `${getFunctionName(query)}|${JSON.stringify(convexToJson(args as Value))}`
}

export function isConvexError(error: unknown, code?: string): error is ConvexError<Value> {
  const isConvex = error instanceof ConvexError || (error instanceof Error && error.name === 'ConvexError' && 'data' in error)
  if (!isConvex || code === undefined)
    return isConvex
  const data = (error as ConvexError<Value>).data
  return data === code || (typeof data === 'object' && data !== null && (data as Record<string, unknown>).code === code)
}

export function encodeSettled(settled: Settled): ConvexHydrationEntry {
  if ('value' in settled)
    return { v: convexToJson(settled.value) }
  const { error } = settled
  return isConvexError(error)
    ? { e: { message: error.message, data: convexToJson(error.data) } }
    : { e: { message: error.message } }
}

export function decodeHydrated(entry: ConvexHydrationEntry): Settled {
  if ('v' in entry)
    return { value: jsonToConvex(entry.v) }
  if (entry.e.data === undefined)
    return { error: new Error(entry.e.message) }
  const error = new ConvexError(jsonToConvex(entry.e.data))
  error.message = entry.e.message
  return { error }
}
