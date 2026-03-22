import type { Where } from 'better-auth/types'
import type { FunctionReference } from 'convex/server'
import { createAdapterFactory } from 'better-auth/adapters'
import { ConvexHttpClient } from 'convex/browser'

type TableNames = string

interface ConvexCleanedWhere {
  field: string
  value: string | number | boolean | string[] | number[] | null
  operator?: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'in' | 'not_in' | 'ne' | 'contains' | 'starts_with' | 'ends_with'
  connector?: 'AND' | 'OR'
}

function parseWhere(where?: Where | Where[]): ConvexCleanedWhere[] {
  if (!where)
    return []

  const whereArray = Array.isArray(where) ? where : [where]
  return whereArray.map((entry) => {
    if (entry.value instanceof Date)
      return { ...entry, value: entry.value.getTime() } as ConvexCleanedWhere

    return entry as ConvexCleanedWhere
  })
}

interface PaginationResult<T> {
  page: T[]
  isDone: boolean
  continueCursor: string | null
  splitCursor?: string
  pageStatus?: 'SplitRecommended' | 'SplitRequired' | string
  count?: number
}

async function handlePagination<T>(
  next: (opts: { paginationOpts: { numItems: number, cursor: string | null } }) => Promise<PaginationResult<T> & { count?: number }>,
  { limit }: { limit?: number } = {},
): Promise<{ docs: T[], count: number }> {
  const state = {
    count: 0,
    cursor: null as string | null,
    docs: [] as T[],
    isDone: false,
  }

  const onResult = (result: PaginationResult<T> & { count?: number }): void => {
    state.cursor = result.pageStatus === 'SplitRecommended' || result.pageStatus === 'SplitRequired'
      ? (result.splitCursor ?? result.continueCursor)
      : result.continueCursor

    if (result.page) {
      state.docs.push(...result.page)
      state.isDone = (limit && state.docs.length >= limit) || result.isDone
      return
    }

    if (result.count) {
      state.count += result.count
      state.isDone = (limit && state.count >= limit) || result.isDone
      return
    }

    state.isDone = result.isDone
  }

  do {
    const result = await next({
      paginationOpts: {
        cursor: state.cursor,
        numItems: Math.min(200, (limit ?? 200) - state.docs.length),
      },
    })

    onResult(result)
  } while (!state.isDone)

  return state
}

interface ConvexAuthApi {
  create: FunctionReference<'mutation', 'public', { input: { model: string, data: Record<string, unknown> }, select?: string[] }, unknown>
  findOne: FunctionReference<'query', 'public', { model: string, where?: ConvexCleanedWhere[], select?: string[] }, unknown>
  findMany: FunctionReference<'query', 'public', { model: string, where?: ConvexCleanedWhere[], limit?: number, sortBy?: { direction: 'asc' | 'desc', field: string }, paginationOpts: { numItems: number, cursor: string | null } }, PaginationResult<unknown>>
  updateOne: FunctionReference<'mutation', 'public', { input: { model: string, where?: ConvexCleanedWhere[], update: Record<string, unknown> } }, unknown>
  updateMany: FunctionReference<'mutation', 'public', { input: { model: string, where?: ConvexCleanedWhere[], update: Record<string, unknown> }, paginationOpts: { numItems: number, cursor: string | null } }, PaginationResult<unknown> & { count: number }>
  deleteOne: FunctionReference<'mutation', 'public', { input: { model: string, where?: ConvexCleanedWhere[] } }, unknown>
  deleteMany: FunctionReference<'mutation', 'public', { input: { model: string, where?: ConvexCleanedWhere[] }, paginationOpts: { numItems: number, cursor: string | null } }, PaginationResult<unknown> & { count: number }>
}

export interface ConvexHttpAdapterOptions {
  url: string
  api: ConvexAuthApi
  debugLogs?: boolean
}

export function createConvexHttpAdapter(options: ConvexHttpAdapterOptions): ReturnType<typeof createAdapterFactory> {
  if (!options.url.startsWith('https://') || !options.url.includes('.convex.'))
    throw new Error(`Invalid Convex URL: ${options.url}. Expected format: https://your-app.convex.cloud`)

  const client = new ConvexHttpClient(options.url)

  return createAdapterFactory({
    config: {
      adapterId: 'convex-http',
      adapterName: 'Convex HTTP Adapter',
      customTransformInput: ({ data, fieldAttributes }) => {
        if (data && fieldAttributes.type === 'date')
          return new Date(data as string | number | Date).getTime()
        return data
      },
      customTransformOutput: ({ data, fieldAttributes }) => {
        if (data && fieldAttributes.type === 'date')
          return new Date(data as number).getTime()
        return data
      },
      debugLogs: options.debugLogs ?? false,
      disableIdGeneration: true,
      mapKeysTransformInput: { id: '_id' },
      mapKeysTransformOutput: { _id: 'id' },
      supportsArrays: true,
      supportsDates: false,
      supportsJSON: false,
      supportsNumericIds: false,
      transaction: false,
      usePlural: false,
    },
    adapter: ({ options: authOptions }) => {
      authOptions.telemetry = { enabled: false }

      return {
        id: 'convex-http',
        count: async (data): Promise<number> => {
          if (data.where?.some((where: Where) => where.connector === 'OR')) {
            const results = await Promise.all(
              data.where.map(async (where: Where) =>
                handlePagination(async ({ paginationOpts }) => client.query(options.api.findMany, {
                  ...data,
                  model: data.model as TableNames,
                  paginationOpts,
                  where: parseWhere(where),
                })),
              ),
            )

            const allDocs = results.flatMap(result => result.docs)
            const uniqueDocs = [...new Map(allDocs.map((doc: unknown) => [(doc as { _id: string })._id, doc])).values()]
            return uniqueDocs.length
          }

          const result = await handlePagination(async ({ paginationOpts }) => client.query(options.api.findMany, {
            ...data,
            model: data.model as TableNames,
            paginationOpts,
            where: parseWhere(data.where),
          }))

          return result.docs.length
        },
        create: async ({ model, data, select }): Promise<unknown> => {
          return client.mutation(options.api.create, {
            input: { data, model: model as TableNames },
            select,
          })
        },
        delete: async ({ model, where }): Promise<void> => {
          await client.mutation(options.api.deleteOne, {
            input: {
              model: model as TableNames,
              where: parseWhere(where),
            },
          })
        },
        deleteMany: async ({ model, where }): Promise<number> => {
          const result = await handlePagination(async ({ paginationOpts }) => client.mutation(options.api.deleteMany, {
            input: {
              model: model as TableNames,
              where: parseWhere(where),
            },
            paginationOpts,
          }))

          return result.count
        },
        findMany: async (data): Promise<unknown[]> => {
          if (data.offset)
            throw new Error('offset not supported')

          if (data.where?.some((where: Where) => where.connector === 'OR')) {
            const results = await Promise.all(
              data.where.map(async (where: Where) =>
                handlePagination(async ({ paginationOpts }) => client.query(options.api.findMany, {
                  ...data,
                  model: data.model as TableNames,
                  paginationOpts,
                  where: parseWhere(where),
                }), { limit: data.limit }),
              ),
            )

            const allDocs = results.flatMap(result => result.docs)
            const uniqueDocs = [...new Map(allDocs.map((doc: unknown) => [(doc as { _id: string })._id, doc])).values()]

            if (data.sortBy) {
              return uniqueDocs.sort((left, right) => {
                const leftValue = (left as Record<string, unknown>)[data.sortBy!.field]
                const rightValue = (right as Record<string, unknown>)[data.sortBy!.field]
                const comparison = leftValue! < rightValue! ? -1 : leftValue! > rightValue! ? 1 : 0
                return data.sortBy!.direction === 'asc' ? comparison : -comparison
              })
            }

            return uniqueDocs
          }

          const result = await handlePagination(async ({ paginationOpts }) => client.query(options.api.findMany, {
            ...data,
            model: data.model as TableNames,
            paginationOpts,
            where: parseWhere(data.where),
          }), { limit: data.limit })

          return result.docs
        },
        findOne: async (data): Promise<unknown> => {
          if (data.where?.every((where: Where) => where.connector === 'OR')) {
            for (const where of data.where) {
              const result = await client.query(options.api.findOne, {
                ...data,
                model: data.model as TableNames,
                where: parseWhere(where),
              })

              if (result)
                return result
            }

            return null
          }

          return client.query(options.api.findOne, {
            ...data,
            model: data.model as TableNames,
            where: parseWhere(data.where),
          })
        },
        update: async ({ model, update, where }): Promise<unknown> => {
          return client.mutation(options.api.updateOne, {
            input: {
              model: model as TableNames,
              update,
              where: parseWhere(where),
            },
          })
        },
        updateMany: async ({ model, update, where }): Promise<number> => {
          const result = await handlePagination(async ({ paginationOpts }) => client.mutation(options.api.updateMany, {
            input: {
              model: model as TableNames,
              update,
              where: parseWhere(where),
            },
            paginationOpts,
          }))

          return result.count
        },
      }
    },
  })
}
