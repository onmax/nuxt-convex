/** `instanceof Error` that also accepts an Error from another realm (node:vm, an iframe). */
export function isError(value: unknown): value is Error {
  return value instanceof Error || Object.prototype.toString.call(value) === '[object Error]'
}
