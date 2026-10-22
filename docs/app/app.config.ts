export default defineAppConfig({
  docus: {
    locale: 'en',
    assistant: false,
  },
  // Nuxt is the primary package, so it comes first. Shared sections (Convex patterns, API reference,
  // integrations, troubleshooting) belong to the Nuxt tab; the Vue sidebar still lists them.
  docsModules: [
    {
      id: 'nuxt',
      label: 'Nuxt',
      to: '/nuxt',
      match: ['/nuxt', '/getting-started', '/nuxt-module', '/convex-patterns', '/api-reference', '/integrations', '/troubleshooting'],
      sidebarRoots: ['/getting-started', '/nuxt-module', '/convex-patterns', '/api-reference', '/integrations', '/troubleshooting'],
    },
    {
      id: 'vue',
      label: 'Vue',
      to: '/vue',
      match: ['/vue', '/vue-guide'],
      sidebarRoots: ['/vue-guide', '/convex-patterns', '/api-reference', '/troubleshooting'],
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
    npm: 'https://npmx.dev/package/nuxt-convex',
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
    pageHeader: {
      slots: {
        // Long composable names such as useConvexConnectionState must fit a 390px screen.
        title: 'text-[1.75rem]/tight sm:text-4xl/tight font-semibold tracking-[-0.02em] text-balance [overflow-wrap:anywhere]',
        description: 'text-base/7 sm:text-lg/8 text-muted text-pretty',
      },
    },
    prose: {
      pre: {
        slots: {
          // Scroll long signatures sideways instead of wrapping them mid-type on small screens.
          base: 'whitespace-pre',
        },
      },
      card: {
        slots: {
          base: 'rounded-xl',
          icon: 'size-5',
          title: 'text-[15px] font-semibold text-highlighted',
          description: 'text-sm/6 text-muted [&_code]:text-[13px]',
        },
      },
    },
  },
})
