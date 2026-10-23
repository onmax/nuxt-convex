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
  // SAFETY: convexToJson checks every value at runtime and throws for anything Convex can't send.
  return `${getFunctionName(query)}|${JSON.stringify(convexToJson(args as Value))}`
}

/** `data[field]` when a `ConvexError` carries an object, like `{ code: 'NOT_FOUND' }`. */
export function readErrorDataField(data: unknown, field: string): unknown {
  return typeof data === 'object' && data !== null ? Reflect.get(data, field) : undefined
}

export function isConvexError(error: unknown, code?: string): error is ConvexError<Value> {
  if (!(error instanceof ConvexError || (error instanceof Error && error.name === 'ConvexError' && 'data' in error)))
    return false
  return code === undefined || error.data === code || readErrorDataField(error.data, 'code') === code
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
