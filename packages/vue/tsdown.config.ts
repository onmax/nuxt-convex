import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/advanced.ts', 'src/storage.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['vue', 'convex', 'convex/browser', 'convex/server'],
})
