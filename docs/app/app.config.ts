export default defineAppConfig({
  docus: {
    locale: 'en',
  },
  header: {
    title: 'Nuxt Convex',
    links: [
      { label: 'Nuxt Module', to: '/nuxt-module', color: 'primary', variant: 'soft' },
      { label: 'Vue Core', to: '/vue-core', color: 'neutral', variant: 'ghost' },
      { label: 'API Reference', to: '/api-reference', color: 'neutral', variant: 'ghost' },
    ],
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
  assistant: {
    faqQuestions: {
      en: [
        {
          category: 'Getting Started',
          items: [
            'How do I install nuxt-convex in a Nuxt app?',
            'When should I use @onmax/convex-vue instead?',
            'How do I generate the #convex/api types?',
          ],
        },
        {
          category: 'Nuxt Module',
          items: [
            'Which module options does nuxt-convex support?',
            'How do storage scaffolding and layer resolution work?',
            'How do I enable Cloudflare R2 uploads?',
          ],
        },
        {
          category: 'API Reference',
          items: [
            'How does useConvexQuery behave during SSR?',
            'What do ConvexQuery and ConvexPaginatedQuery expose?',
            'What is the difference between useConvexUpload and useConvexR2Upload?',
          ],
        },
      ],
    },
  },
  toc: {
    title: 'On This Page',
    bottom: {
      title: 'Related Docs',
      links: [
        {
          icon: 'i-lucide-book-open',
          label: 'Convex documentation',
          to: 'https://docs.convex.dev',
          target: '_blank',
        },
        {
          icon: 'i-lucide-book-open',
          label: 'Nuxt UI documentation',
          to: 'https://ui.nuxt.com',
          target: '_blank',
        },
        {
          icon: 'i-lucide-book-open',
          label: 'Better Auth documentation',
          to: 'https://www.better-auth.com/docs',
          target: '_blank',
        },
      ],
    },
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
        title: 'font-semibold sm:text-6xl',
      },
    },
    pageSection: {
      slots: {
        title: 'font-semibold',
      },
    },
  },
})
