export default defineAppConfig({
  github: {
    url: 'https://github.com/onmax/nuxt-convex',
    branch: 'main',
    rootDir: 'docs',
  },
  header: {
    links: [
      { label: 'Docs', to: '/getting-started/introduction' },
      { label: 'Demo', to: 'https://demo-nuxt-convex.onmax.me', target: '_blank' },
      { label: 'Convex', to: 'https://docs.convex.dev', target: '_blank' },
    ],
  },
  navigation: {
    links: [
      { title: 'Demo', to: 'https://demo-nuxt-convex.onmax.me', target: '_blank', icon: 'i-heroicons-play' },
      { title: 'Better Auth', to: 'https://nuxt-better-auth.onmax.me/integrations/convex', target: '_blank', icon: 'i-heroicons-arrow-top-right-on-square' },
    ],
  },
  ui: {
    colors: {
      primary: 'amber',
      neutral: 'stone',
    },
  },
})
