const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '0.0.0.0'])

/**
 * Derive the HTTP actions URL from a deployment URL:
 * `https://x.convex.cloud` -> `https://x.convex.site`, and a local backend's port + 1 (`3210` -> `3211`).
 */
export function toConvexSiteUrl(convexUrl: string): string | undefined {
  let url: URL
  try {
    url = new URL(convexUrl)
  }
  catch {
    return
  }

  if (url.hostname.endsWith('.convex.cloud'))
    url.hostname = url.hostname.replace(/\.convex\.cloud$/, '.convex.site')
  else if (LOCAL_HOSTS.has(url.hostname) && url.port)
    url.port = String(Number(url.port) + 1)
  else
    return

  return url.origin
}

export function resolveConvexSiteUrl(config: { url?: string, siteUrl?: string } | undefined): string | undefined {
  return config?.siteUrl || (config?.url ? toConvexSiteUrl(config.url) : undefined)
}
