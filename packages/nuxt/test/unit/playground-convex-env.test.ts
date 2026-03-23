import { afterEach, describe, expect, it } from 'vitest'
import { getPlaygroundSiteUrl } from '../../../../playground/convex/env'

const originalEnv = { ...process.env }

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv))
      delete process.env[key]
  }

  Object.assign(process.env, originalEnv)
})

describe('playground convex env helpers', () => {
  it('uses localhost for local development when preview env is unset', () => {
    delete process.env.NODE_ENV
    delete process.env.NUXT_PUBLIC_SITE_URL
    delete process.env.SITE_URL

    expect(getPlaygroundSiteUrl()).toBe('http://localhost:3000')
  })

  it('uses the demo deployment url in production when preview env is unset', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.NUXT_PUBLIC_SITE_URL
    delete process.env.SITE_URL

    expect(getPlaygroundSiteUrl()).toBe('https://demo-nuxt-convex.onmax.me')
  })

  it('prefers explicit site url overrides', () => {
    process.env.NODE_ENV = 'production'
    process.env.NUXT_PUBLIC_SITE_URL = 'https://preview.example.workers.dev'

    expect(getPlaygroundSiteUrl()).toBe('https://preview.example.workers.dev')

    delete process.env.NUXT_PUBLIC_SITE_URL
    process.env.SITE_URL = 'https://fallback.example.workers.dev'

    expect(getPlaygroundSiteUrl()).toBe('https://fallback.example.workers.dev')
  })
})
