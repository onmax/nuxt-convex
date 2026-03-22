import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useConvexR2Upload } from '../src/runtime/composables/useConvexR2Upload'

const { mutation, useConvexClient } = vi.hoisted(() => {
  const mutation = vi.fn()
  const useConvexClient = vi.fn(() => ({ mutation }))
  return { mutation, useConvexClient }
})

vi.mock('#nuxt-convex/advanced-runtime', () => {
  return {
    useConvexClient,
  }
})

class MockXMLHttpRequest {
  upload: { onprogress?: (event: { loaded: number, total: number }) => void } = {}
  onerror?: () => void
  onload?: () => void
  status = 200
  statusText = 'OK'

  open = vi.fn()

  send = vi.fn((file: File) => {
    this.upload.onprogress?.({ loaded: file.size / 2, total: file.size })
    this.onload?.()
  })

  setRequestHeader = vi.fn()
}

describe('useConvexR2Upload', () => {
  beforeEach(() => {
    mutation.mockReset()
    useConvexClient.mockClear()
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest)
  })

  it('captures the Convex client during setup', () => {
    const api = {
      generateUploadUrl: { _name: 'r2:generateUploadUrl' },
      syncMetadata: { _name: 'r2:syncMetadata' },
    }

    useConvexR2Upload(api)

    expect(useConvexClient).toHaveBeenCalledTimes(1)
  })

  it('uploads via the Convex client and syncs metadata', async () => {
    mutation
      .mockResolvedValueOnce({ key: 'file-key', url: 'https://upload.test' })
      .mockResolvedValueOnce(undefined)

    const onProgress = vi.fn()
    const onSuccess = vi.fn()
    const file = new File(['hello world'], 'demo.txt', { type: 'text/plain' })
    const api = {
      generateUploadUrl: { _name: 'r2:generateUploadUrl' },
      syncMetadata: { _name: 'r2:syncMetadata' },
    }

    const { error, isUploading, progress, upload } = useConvexR2Upload(api, { onProgress, onSuccess })
    expect(useConvexClient).toHaveBeenCalledTimes(1)

    const key = await upload(file)

    expect(key).toBe('file-key')
    expect(useConvexClient).toHaveBeenCalledTimes(1)
    expect(mutation).toHaveBeenNthCalledWith(1, api.generateUploadUrl, {})
    expect(mutation).toHaveBeenNthCalledWith(2, api.syncMetadata, { key: 'file-key' })
    expect(progress.value).toBe(100)
    expect(error.value).toBeNull()
    expect(isUploading.value).toBe(false)
    expect(onProgress).toHaveBeenCalledWith({ loaded: file.size / 2, total: file.size })
    expect(onSuccess).toHaveBeenCalledWith('file-key', file)
  })
})
