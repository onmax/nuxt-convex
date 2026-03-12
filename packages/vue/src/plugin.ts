import type { ObjectPlugin, ShallowRef } from 'vue'
import type { ConvexVueContext, ConvexVueOptions, ResolvedConvexVueOptions } from './internal/context'
import { ConvexClient, ConvexHttpClient } from 'convex/browser'
import { shallowRef } from 'vue'
import { CONVEX_VUE_KEY } from './internal/context'

function resolveOptions(options: ConvexVueOptions): ResolvedConvexVueOptions {
  return {
    ...options,
    server: options.server ?? true,
  }
}

export const convexVue: ObjectPlugin<ConvexVueOptions> = {
  install(app, initialOptions) {
    const options = shallowRef(resolveOptions(initialOptions))
    const clientRef = shallowRef<ConvexClient>() as ShallowRef<ConvexClient | undefined>
    const httpClientRef = shallowRef(new ConvexHttpClient(options.value.url, {
      logger: options.value.clientOptions?.logger,
      skipConvexDeploymentUrlCheck: options.value.clientOptions?.skipConvexDeploymentUrlCheck,
    }))

    const initClient = (nextOptions?: ConvexVueOptions): void => {
      if (nextOptions) {
        options.value = resolveOptions({
          ...options.value,
          ...nextOptions,
        })
      }

      httpClientRef.value = new ConvexHttpClient(options.value.url, {
        logger: options.value.clientOptions?.logger,
        skipConvexDeploymentUrlCheck: options.value.clientOptions?.skipConvexDeploymentUrlCheck,
      })

      if (typeof window === 'undefined') {
        clientRef.value = undefined
        return
      }

      clientRef.value = new ConvexClient(options.value.url, options.value.clientOptions)
    }

    if (!options.value.manualInit)
      initClient()

    const context: ConvexVueContext = {
      options,
      clientRef,
      httpClientRef,
      initClient,
    }

    app.provide(CONVEX_VUE_KEY, context)
  },
}
