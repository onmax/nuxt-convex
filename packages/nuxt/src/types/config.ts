import type { ConvexClientOptions } from 'convex/browser'

type SerializableClientOption
  = | 'verbose'
    | 'unsavedChangesWarning'
    | 'skipConvexDeploymentUrlCheck'
    | 'authRefreshTokenLeewaySeconds'
    | 'expectAuth'
    | 'reportDebugInfoToConvex'
    | 'initialAuthTokenReuse'

/** The JSON-serializable `ConvexClient` options. They travel through `runtimeConfig`. */
export type ConvexClientConfig = Pick<ConvexClientOptions, SerializableClientOption> & {
  /** `false` silences the client's console logging */
  logger?: boolean
}

export interface ConvexAuthConfig {
  /**
   * Built-in token provider used for SSR, the server helpers and the browser client.
   * `'better-auth'` exchanges the Better Auth session cookie for a Convex JWT (`@convex-dev/better-auth`).
   * With `false`, supply tokens through the `convex:token` server hook.
   * @default 'better-auth' when `@nuxtjs/better-auth` is installed, otherwise `false`
   */
  provider?: 'better-auth' | false
  /**
   * Better Auth base path. The Convex token is read from `<basePath>/convex/token`.
   * @default '/api/auth'
   */
  basePath?: string
  /**
   * Proxy `<basePath>/**` to the Convex site URL, where Better Auth runs as a Convex component.
   * @default true with the better-auth provider, unless `@nuxtjs/better-auth` runs its own server (`auth.clientOnly: false`)
   */
  proxy?: boolean
}

export interface ConvexConfig {
  /**
   * Convex deployment URL.
   * Falls back to `CONVEX_URL`, `NUXT_PUBLIC_CONVEX_URL` or `VITE_CONVEX_URL`, then `.env.local` in development.
   * `NUXT_PUBLIC_CONVEX_URL` overrides it at runtime.
   */
  url?: string
  /**
   * Convex HTTP actions URL (`https://<name>.convex.site`).
   * Falls back to `CONVEX_SITE_URL`, then is derived from `url`. `NUXT_PUBLIC_CONVEX_SITE_URL` overrides it at runtime.
   */
  siteUrl?: string
  /** Convex source directory. Relative paths are discovered across Nuxt layers. */
  dir?: string
  /**
   * Run queries during SSR by default
   * @default true
   */
  ssr?: boolean
  /** @deprecated Use `ssr` */
  server?: boolean
  /** Enable file storage integration. When true, scaffolds convex/_hub/storage.ts */
  storage?: boolean
  /** Enable Cloudflare R2 integration */
  r2?: boolean
  /** Options passed to the browser `ConvexClient` */
  clientOptions?: ConvexClientConfig
  /** Authentication integration. `false` disables the built-in provider, proxy and client plugin. */
  auth?: boolean | ConvexAuthConfig
  /**
   * Add a Convex tab to Nuxt DevTools
   * @default true
   */
  devtools?: boolean
}

export interface ResolvedConvexAuthConfig {
  provider: 'better-auth' | 'none'
  basePath: string
  proxy: boolean
}

/** Shape of `runtimeConfig.public.convex` */
export interface ConvexPublicRuntimeConfig {
  url: string
  siteUrl: string
  ssr: boolean
  storage: boolean
  r2: boolean
  clientOptions: ConvexClientConfig
  auth: ResolvedConvexAuthConfig
}
