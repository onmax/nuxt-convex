import type { ConvexVueController, ConvexVueOptions } from './internal/runtime'
import { createConvexRuntimeContext } from './internal/runtime'
import { useConvexRuntimeContext } from './internal/useConvexRuntimeContext'

export function createConvexVueController(initialOptions: ConvexVueOptions = {}): ConvexVueController {
  return createConvexRuntimeContext(initialOptions).controller
}

export function useConvexController(): ConvexVueController {
  return useConvexRuntimeContext().controller
}
