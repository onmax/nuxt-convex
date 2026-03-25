export default defineAppConfig({
  docus: {
    locale: 'en',
    assistant: false,
  },
  docsModules: [
    {
      id: 'vue',
      label: 'Vue',
      to: '/vue',
      match: ['/vue', '/vue-guide', '/api-reference', '/convex-patterns'],
      sidebarRoots: ['/vue-guide', '/api-reference', '/convex-patterns'],
    },
    {
      id: 'nuxt',
      label: 'Nuxt',
      to: '/nuxt',
      match: ['/nuxt', '/getting-started', '/nuxt-module', '/integrations'],
      sidebarRoots: ['/getting-started', '/nuxt-module', '/integrations'],
    },
  ],
  header: {
    title: 'Nuxt Convex',
  },
  github: {
    url: 'https://github.com/onmax/nuxt-convex',
    branch: 'main',
    rootDir: 'docs',
  },
  socials: {
    npm: 'https://www.npmjs.com/package/nuxt-convex',
    nuxt: 'https://nuxt.com',
  },
  assistant: { enabled: false, explainWithAi: false },
  toc: {
    title: 'On This Page',
  },
  ui: {
    colors: {
      primary: 'convex',
      secondary: 'amber',
      neutral: 'zinc',
      success: 'emerald',
      info: 'sky',
      warning: 'yellow',
      error: 'rose',
    },
    commandPalette: {
      slots: {
        item: 'items-center',
        input: '[&_.iconify]:size-4 [&_.iconify]:mx-0.5',
        itemLeadingIcon: 'size-4 mx-0.5',
      },
    },
    contentNavigation: {
      slots: {
        linkLeadingIcon: 'size-4 mr-1',
        linkTrailing: 'hidden',
      },
      defaultVariants: {
        variant: 'link',
      },
    },
    pageLinks: {
      slots: {
        linkLeadingIcon: 'size-4',
        linkLabelExternalIcon: 'size-2.5',
      },
    },
    pageHero: {
      slots: {
        title: 'font-semibold sm:text-5xl lg:text-6xl',
        description: 'text-lg sm:text-xl text-muted max-w-2xl mx-auto',
        links: 'gap-3',
      },
    },
    pageSection: {
      slots: {
        title: 'font-semibold !leading-snug',
        description: 'text-muted max-w-2xl mx-auto',
      },
    },
    pageCard: {
      slots: {
        leadingIcon: 'size-5 text-primary',
        title: 'font-semibold',
        description: 'text-muted font-normal',
      },
    },
  },
})
