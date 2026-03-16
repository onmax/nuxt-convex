# Nuxt Skill Map

This map routes you through Nuxt's common forks before deeper packs.

## How to use this map
1. Explore the current surface first: page, layout, component, server handler, content collection, or module-owned file.
2. Load the first matching pack from the routing table below.
3. Open deeper packs only when the first pack points you there.
4. If an installed module is involved, open that module wrapper before the copied module `SKILL.md`.
5. If a module wrapper only gives links, use its static docs and repo URLs as the escalation path.


## Common forks in the road

| Task shape or symptom | Load first | Why |
| --- | --- | --- |
| SSR, initial page load, route params, or hydration-sensitive data | [Data Fetching and SSR](./core/rules/data-fetching-ssr.md) | Prefer `useFetch` or `useAsyncData` over setup-time `$fetch` or `onMounted` fetches. |
| Page options, route middleware, layout selection, title, meta tags, or OG data | [Page Meta, Head, and Layout](./core/rules/page-meta-head-layout.md) | Separate page behavior from document metadata and layout structure before editing. |
| A generic Vue fix or raw HTML implementation looks tempting | [Abstraction Disambiguation](./core/rules/abstraction-disambiguation.md) | Check whether Nuxt, Nuxt Content, or Nuxt UI already owns the abstraction. |
| Global errors, local fallback UI, `clearError`, `showError`, or recovery flows | [Error Surfaces and Recovery](./core/rules/error-surfaces-recovery.md) | Nuxt error handling often needs both global and local surfaces to be correct. |
| Nuxt Content JSON or YAML records, collection shape, docs nav, or sidebars | [Content Modeling and Navigation](./core/rules/content-modeling-navigation.md) | Choose `type: 'data'` and collection-navigation primitives before manual assembly. |
| Tables, forms, modals, command palettes, dropdowns, or page chrome | [Nuxt UI Primitives](./core/rules/nuxt-ui-primitives.md) | Prefer the current Nuxt UI primitive and API shape before hand-rolled markup or listeners. |
| Secrets, runtime config, privileged API calls, or server/client boundary confusion | [Architecture Boundaries](./core/rules/architecture-boundaries.md) | Move sensitive logic server-side first, then pair with config and route rules as needed. |
| Before finishing a fix that spans multiple files or surfaces | [Verification and Finish](./core/rules/verification-finish.md) | Re-check paired surfaces and verify framework behavior, not only the visible output. |

## All core packs

| Pack | Focus | Typical triggers |
| --- | --- | --- |
| [Abstraction Disambiguation](./core/rules/abstraction-disambiguation.md) | Choose Nuxt-owned abstractions before generic Vue, raw HTML, or ad hoc glue code. | A generic Vue or HTML fix looks plausible<br>You need to decide whether Nuxt, Nuxt Content, or Nuxt UI already owns the surface |
| [Page Meta, Head, and Layout](./core/rules/page-meta-head-layout.md) | Separate page behavior, document metadata, and layout structure before editing. | Pages, layouts, middleware, or page options<br>Title, meta tags, canonical URLs, or OG metadata |
| [Error Surfaces and Recovery](./core/rules/error-surfaces-recovery.md) | Cover both global and local error boundaries and use the right recovery utilities. | Global error pages or local error boundaries<br>Recovery flows, clearError, showError, or fallback UI |
| [Content Modeling and Navigation](./core/rules/content-modeling-navigation.md) | Model structured records correctly and use collection and navigation primitives before manual assembly. | Nuxt Content collections, JSON or YAML records, or generated navigation<br>Sidebar, docs navigation, or content-derived listings |
| [Nuxt UI Primitives](./core/rules/nuxt-ui-primitives.md) | Prefer first-class Nuxt UI surfaces and their current API shape before hand-rolled markup. | Tables, forms, modals, command palettes, dropdowns, or page chrome<br>A custom HTML implementation looks visually correct but framework-owned primitives exist |
| [Verification and Finish](./core/rules/verification-finish.md) | Verify the intended framework behavior and re-check paired surfaces before concluding work. | The fix spans more than one surface<br>You are about to finish a Nuxt change and need to confirm the right abstraction |
| [Data Fetching and SSR](./core/rules/data-fetching-ssr.md) | Deduplication, payload correctness, and request-safe loading. | Pages, layouts, or composables fetching initial data<br>SSR-visible content or hydration-sensitive state |
| [Hydration and SSR Consistency](./core/rules/hydration-consistency.md) | SSR/CSR determinism, client-only boundaries, and mismatch prevention. | Hydration warnings or client-only rendering<br>State that differs between server and browser |
| [Architecture Boundaries](./core/rules/architecture-boundaries.md) | Server-only secrets, request isolation, and safe shared abstractions. | Crossing server/client boundaries<br>Composable or utility architecture changes |
| [Server Routes and Runtime Config](./core/rules/server-routes-runtime-config.md) | Runtime config exposure, env handling, and route-level contracts. | nuxt.config, runtime config, or env wiring<br>Server route config and public/private config exposure |
| [Nitro and h3 Server Patterns](./core/rules/nitro-h3-patterns.md) | Handler contracts, caching, and edge-safe server behavior. | Server routes, middleware, Nitro plugins, or h3 handlers<br>API behavior, caching, or edge runtime concerns |
| [Plugins and Runtime Boot](./core/rules/plugins.md) | Plugin ordering, startup cost, and app/runtime initialization. | Plugins, app boot logic, or injected runtime helpers<br>Global runtime behavior changes |
| [Performance and Rendering](./core/rules/performance-rendering.md) | Rendering strategy, payload cost, and lazy loading tradeoffs. | Performance regressions or rendering strategy changes<br>Link, asset, and bundle cost decisions |
| [Module Authoring Conventions](./core/rules/module-authoring.md) | Nuxt Kit patterns, module lifecycle, and ecosystem-safe authoring. | Writing or refactoring a Nuxt module<br>Module install/setup conventions |
| [Migrations and Compatibility](./core/rules/migrations.md) | Incremental upgrades, compatibility boundaries, and rollout safety. | Upgrades, deprecations, or breaking behavior changes<br>Compatibility fixes across Nuxt versions |

## Module guides

Read a generated module wrapper first. It explains provenance, trust, scope boundaries, and how to use copied guidance as delta-only module context.

### GitHub-resolved skills
- [@nuxt/ui](./modules/nuxt-ui/nuxt-ui.md) `v4.5.1` - GitHub-resolved skill. Trust: `official`. Build UIs with @nuxt/ui v4 — 125+ accessible Vue components with Tailwind CSS theming. Use when creating interfaces, customizing themes to match a brand, building forms, or composing layouts like dashboards, docs sites, and chat interfaces.

### Metadata-routed skills
- [@nuxthub/core](./modules/nuxthub-core/core.md) `v0.10.5` - Metadata-routed skill. Trust: `official`. Build full-stack Nuxt applications, with zero configuration.
- [@onmax/nuxt-better-auth](./modules/onmax-nuxt-better-auth/nuxt-better-auth.md) `v0.0.2-alpha.30` - Metadata-routed skill. Trust: `official`. Nuxt module for Better Auth integration with NuxtHub, route protection, session management, and role-based access

### Skipped or unavailable
- **@onmax/nuxt-better-auth** / `nuxt-better-auth` (`dist`): SKILL.md is required at skill root. Use the relevant core pack plus the module's official docs.

---

_Generated by nuxt-skill-hub. Do not edit this file manually._
