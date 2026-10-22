import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useConvexR2Upload } from '../../src/runtime/composables/useConvexR2Upload'

const { getClient, mutation } = vi.hoisted(() => {
  const mutation = vi.fn()
  const getClient = vi.fn((): { mutation: typeof mutation } | undefined => ({ mutation }))
  return { getClient, mutation }
})

vi.mock('#nuxt-convex/advanced-runtime', () => {
  return {
    useConvexController: () => ({ getClient }),
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
    getClient.mockClear()
    vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest)
  })

  it('can be set up without a realtime client, as during SSR', async () => {
    getClient.mockReturnValueOnce(undefined)
    const onError = vi.fn()
    const api = {
      generateUploadUrl: { _name: 'r2:generateUploadUrl' },
      syncMetadata: { _name: 'r2:syncMetadata' },
    }

    const { upload } = useConvexR2Upload(api, { onError })

    expect(getClient).not.toHaveBeenCalled()
    await expect(upload(new File(['x'], 'x.txt'))).resolves.toBeNull()
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: '[nuxt-convex] Convex realtime client is not connected' }))
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

    const key = await upload(file)

    expect(key).toBe('file-key')
    expect(getClient).toHaveBeenCalledTimes(1)
    expect(mutation).toHaveBeenNthCalledWith(1, api.generateUploadUrl, {})
    expect(mutation).toHaveBeenNthCalledWith(2, api.syncMetadata, { key: 'file-key' })
    expect(progress.value).toBe(100)
    expect(error.value).toBeNull()
    expect(isUploading.value).toBe(false)
    expect(onProgress).toHaveBeenCalledWith({ loaded: file.size / 2, total: file.size })
    expect(onSuccess).toHaveBeenCalledWith('file-key', file)
  })
})
