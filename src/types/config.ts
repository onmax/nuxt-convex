export interface ConvexConfig {
  /** Convex deployment URL. Auto-detected from CONVEX_URL or NUXT_PUBLIC_CONVEX_URL env vars */
  url?: string
  /** Enable file storage integration. When true, scaffolds convex/_hub/storage.ts */
  storage?: boolean
}

export interface ResolvedConvexConfig {
  url: string
  storage: boolean
}
