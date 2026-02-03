import { R2 } from '@convex-dev/r2'
import { componentsGeneric } from 'convex/server'
import type { DataModel } from './_generated/dataModel'

const components = componentsGeneric()

export const r2 = new R2(components.r2)

export const {
  generateUploadUrl,
  syncMetadata,
  getMetadata,
  listMetadata,
  deleteObject,
} = r2.clientApi<DataModel>()
