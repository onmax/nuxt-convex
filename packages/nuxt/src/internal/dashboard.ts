export const CLOUD_DASHBOARD_URL = 'https://dashboard.convex.dev'
/** Dashboard served by `npx convex dev` for anonymous local deployments */
export const LOCAL_DASHBOARD_URL = 'http://127.0.0.1:6790/'

/**
 * Mirrors the Convex CLI: anonymous deployments use the local dashboard, every other
 * deployment is addressed as `/d/<deployment-name>`. Self-hosted backends return `undefined`.
 */
export function resolveDashboardUrl(input: { url?: string, deployment?: string }): string | undefined {
  if (input.deployment) {
    const [type, name] = input.deployment.split(':')
    if (type === 'anonymous')
      return LOCAL_DASHBOARD_URL
    if (name)
      return `${CLOUD_DASHBOARD_URL}/d/${name}`
  }

  if (!input.url)
    return

  let hostname: string
  try {
    hostname = new URL(input.url).hostname
  }
  catch {
    return
  }

  if (hostname.endsWith('.convex.cloud'))
    return `${CLOUD_DASHBOARD_URL}/d/${hostname.split('.')[0]}`
  if (hostname === '127.0.0.1' || hostname === 'localhost')
    return LOCAL_DASHBOARD_URL
}
