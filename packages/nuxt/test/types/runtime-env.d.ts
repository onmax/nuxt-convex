// Ambient modules for type-checking src/runtime outside a Nuxt app (tsconfig.runtime.json).
// In an app these aliases come from the templates nuxt-convex registers.
/// <reference types="nuxt/app" />

declare module '#imports' {
  export * from 'nuxt/app'
}

declare module '#convex' {
  export * from 'vue-convex'
}

declare module '#nuxt-convex/advanced-runtime' {
  export * from 'vue-convex/advanced'
}

declare module '#nuxt-convex/storage-runtime' {
  export * from 'vue-convex/storage'
}

declare module '#nuxt-convex/storage-refs-runtime' {
  export function getStorageRefs(): Record<string, unknown> | undefined
}
