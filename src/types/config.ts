export interface ConvexConfig {
  /** Convex deployment URL. Auto-detected from CONVEX_URL or NUXT_PUBLIC_CONVEX_URL env vars */
  url?: string
  /** Convex source directory. Discovered across Nuxt layers when relative. */
  dir?: string
  /** Enable file storage integration. When true, scaffolds convex/_hub/storage.ts */
  storage?: boolean
  /** Enable Cloudflare R2 integration */
  r2?: boolean
}

export interface ResolvedConvexConfig {
  url: string
  dir: string
  storage: boolean
  r2: boolean
}
