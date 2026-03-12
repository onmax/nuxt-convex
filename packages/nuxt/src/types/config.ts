export interface ConvexConfig {
  /** Convex deployment URL. Auto-detected from CONVEX_URL or NUXT_PUBLIC_CONVEX_URL env vars */
  url?: string
  /** Convex source directory. Relative paths are discovered across Nuxt layers. */
  dir?: string
  /** Enable SSR queries by default */
  server?: boolean
  /** Enable file storage integration. When true, scaffolds convex/_hub/storage.ts */
  storage?: boolean
  /** Enable Cloudflare R2 integration */
  r2?: boolean
}

export interface ResolvedConvexConfig {
  url: string
  dir: string
  server: boolean
  storage: boolean
  r2: boolean
}
