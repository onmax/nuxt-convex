import type { Auth } from 'convex/server'
import type { DataModel } from './_generated/dataModel'
import { R2 } from '@convex-dev/r2'
import { componentsGeneric } from 'convex/server'
import { requireUserId } from './identity'

const components = componentsGeneric()

export const r2 = new R2(components.r2)

async function requireSignedIn(ctx: { auth: Auth }): Promise<void> {
  await requireUserId(ctx)
}

export const {
  generateUploadUrl,
  syncMetadata,
  getMetadata,
  listMetadata,
  deleteObject,
} = r2.clientApi<DataModel>({
  checkUpload: requireSignedIn,
  checkReadKey: requireSignedIn,
  checkReadBucket: requireSignedIn,
  checkDelete: requireSignedIn,
})
