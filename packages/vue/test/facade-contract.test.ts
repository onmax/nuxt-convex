import { describe, expectTypeOf, it } from 'vitest'
import type { DeepReadonly, Ref } from 'vue'
import type { UseConvexConnectionStateReturn } from '../src/useConvexConnectionState'
import type { UseConvexPaginatedQueryReturn } from '../src/useConvexPaginatedQuery'
import type { UseConvexQueriesReturn } from '../src/useConvexQueries'
import type { UseConvexQueryReturn } from '../src/useConvexQuery'
import { createHarness, paginatedRef, queryRef, storageRefs } from './helpers/runtimeHarness'

describe('runtime facade contract', () => {
  it('matches the public wrapper return shapes', () => {
    const harness = createHarness({ options: { url: 'https://test.convex.cloud' } })

    expectTypeOf(harness.run(() => harness.facade.query(queryRef, { userId: '1' }))).toMatchTypeOf<UseConvexQueryReturn<typeof queryRef>>()
    expectTypeOf(harness.run(() => harness.facade.queries({
      list: { query: queryRef, args: { userId: '1' } },
    }))).toMatchTypeOf<UseConvexQueriesReturn<{
      list: { query: typeof queryRef, args: { userId: string } }
    }>>()
    expectTypeOf(harness.run(() => harness.facade.pagination(paginatedRef, { userId: '1' }, { numItems: 2 }))).toMatchTypeOf<
      UseConvexPaginatedQueryReturn<{ _id: string }>
    >()
    expectTypeOf(harness.run(() => harness.facade.connection())).toMatchTypeOf<UseConvexConnectionStateReturn>()
    expectTypeOf(harness.run(() => harness.facade.liveValue(storageRefs.getUrl, { storageId: 'storage-1' }, null))).toMatchTypeOf<
      DeepReadonly<Ref<string | null>>
    >()

    harness.stop()
  })
})
