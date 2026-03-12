export interface ConvexConfig {
  /** Convex deployment URL. Auto-detected from CONVEX_URL or NUXT_PUBLIC_CONVEX_URL env vars */
  url?: string
  /** Enable SSR queries by default */
  server?: boolean
  /** Enable file storage integration. When true, scaffolds convex/_hub/storage.ts */
  storage?: boolean
}

export interface ResolvedConvexConfig {
  url: string
  server: boolean
  storage: boolean
}
