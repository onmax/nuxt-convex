---
name: "nuxt"
description: "Always-on Nuxt disambiguation layer for this project. Use it to choose the right Nuxt pack first, then switch to Vue or module guidance only when Nuxt no longer owns the abstraction."
---

# Nuxt Skill Index

This file keeps the highest-frequency Nuxt decisions in context.
Use it to avoid generic Vue fallbacks, then route into the right Nuxt pack, Vue guidance, or module delta skill.

## Monorepo Scope
This skill applies only to the `playground` subtree of this monorepo.
Treat files and tasks outside `playground` as out of scope unless the user explicitly redirects you there.



## Activation Flow
1. Explore the project first: inspect the real page, component, route, server handler, collection, or module surface you are changing.
2. Use the routing sections in this file and load the smallest matching Nuxt pack.
3. If the remaining work is mainly Vue component, composable, reactivity, or SFC work, open [Vue Best Practices](./references/vue/SKILL.md).
4. If module authoring is part of the task, load [Module Authoring Conventions](./references/nuxt/rules/module-authoring.md) before changing `defineNuxtModule`, runtime extensions, hooks, or release scaffolding.
5. If an installed module owns the problem, open its entry under [references/modules](./references/modules).
6. Apply module guidance as delta-only rules inside that module's APIs, config, runtime behavior, and owned files.

## High-Frequency Nuxt Decisions
- If the task touches SSR, initial page load, or route-driven data, prefer `useFetch` or `useAsyncData` before `onMounted` plus `$fetch`.
- If the task changes page options, layout selection, route middleware, or page-level behavior, check `definePageMeta` before adding ad hoc wiring.
- If the task changes title, meta tags, canonical URLs, or OG data, check `useHead` or `useSeoMeta` before page-meta or template markup.
- If content lives in JSON or YAML records, or the UI needs generated docs navigation, choose data collections and collection-navigation primitives before manual assembly.
- If the UI surface is page chrome, a table, a form, a modal, a command palette, or a dropdown, prefer a Nuxt UI primitive before raw HTML or custom listeners.
- If runtime config, tokens, secrets, or privileged API calls are involved, keep them server-side and expose only a server route or the minimum public config.
- If hydration, browser-only APIs, time, randomness, or cookies are involved, use SSR-safe primitives first and isolate browser-only work behind `ClientOnly` or `onMounted`.
- If the fix touches errors, fallback UI, or recovery flow, check both global and local surfaces before concluding the work is complete.
- If the solution looks correct but uses generic Vue or hand-rolled HTML, confirm Nuxt, Nuxt Content, or Nuxt UI does not already own that abstraction.
- If the task is module-specific, use the module entry and keep module guidance scoped; do not replace broad Nuxt rules with module-specific rules.

## Precedence
- Repository-global instructions and required workflows win first.
- This file keeps the common Nuxt forks in context.
- Nuxt packs provide deeper framework guidance.
- Vue guidance covers component, composable, and SFC patterns after the Nuxt decision is settled.
- Module entries add delta-only guidance inside explicit module scope.

## How to use this skill map
1. Explore the current surface first: page, layout, component, server handler, content collection, or module-owned file.
2. Load the first matching Nuxt pack from the routing table below.
3. If the remaining work is mainly Vue component or composable implementation, switch to [Vue Best Practices](./references/vue/SKILL.md).
4. Open deeper Nuxt packs only when the first pack points you there.

5. If an installed module is involved, open its entry under `references/modules`.
6. Copied skills go straight to their `SKILL.md`; metadata-routed modules only expose docs and source links.


## Common forks in the road

| Task shape or symptom | Load first | Why |
| --- | --- | --- |
| SSR, initial page load, route params, or hydration-sensitive data | [Data Fetching and SSR](./references/nuxt/rules/data-fetching-ssr.md) | Prefer `useFetch` or `useAsyncData` over setup-time `$fetch` or `onMounted` fetches. |
| Page options, route middleware, layout selection, title, meta tags, or OG data | [Page Meta, Head, and Layout](./references/nuxt/rules/page-meta-head-layout.md) | Separate page behavior from document metadata and layout structure before editing. |
| A generic Vue fix or raw HTML implementation looks tempting | [Abstraction Disambiguation](./references/nuxt/rules/abstraction-disambiguation.md) | Check whether Nuxt, Nuxt Content, or Nuxt UI already owns the abstraction. |
| The remaining work is mostly `.vue` components, composables, reactivity, or SFC structure | [Vue Best Practices](./references/vue/SKILL.md) | Switch to Vue-specific guidance after the Nuxt ownership and routing decisions are already settled. |
| Global errors, local fallback UI, `clearError`, `showError`, or recovery flows | [Error Surfaces and Recovery](./references/nuxt/rules/error-surfaces-recovery.md) | Nuxt error handling often needs both global and local surfaces to be correct. |
| Secrets, runtime config, privileged API calls, or server/client boundary confusion | [Architecture Boundaries](./references/nuxt/rules/architecture-boundaries.md) | Move sensitive logic server-side first, then pair with config and route rules as needed. |
| Before finishing a fix that spans multiple files or surfaces | [Verification and Finish](./references/nuxt/rules/verification-finish.md) | Re-check paired surfaces and verify framework behavior, not only the visible output. |

## Vue guidance

Use [Vue Best Practices](./references/vue/SKILL.md) when the task is mainly Vue component, composable, reactivity, props/emits, or SFC work and Nuxt no longer owns the abstraction.

Start with these must-read Vue references:
- [reactivity](./references/vue/references/reactivity.md)
- [sfc](./references/vue/references/sfc.md)
- [component-data-flow](./references/vue/references/component-data-flow.md)
- [composables](./references/vue/references/composables.md)


## All Nuxt packs

| Pack | Focus | Typical triggers |
| --- | --- | --- |
| [Abstraction Disambiguation](./references/nuxt/rules/abstraction-disambiguation.md) | Choose Nuxt-owned abstractions before generic Vue, raw HTML, or ad hoc glue code. | A generic Vue or HTML fix looks plausible<br>You need to decide whether Nuxt, Nuxt Content, or Nuxt UI already owns the surface |
| [Page Meta, Head, and Layout](./references/nuxt/rules/page-meta-head-layout.md) | Separate page behavior, document metadata, and layout structure before editing. | Pages, layouts, middleware, or page options<br>Title, meta tags, canonical URLs, or OG metadata |
| [Error Surfaces and Recovery](./references/nuxt/rules/error-surfaces-recovery.md) | Cover both global and local error boundaries and use the right recovery utilities. | Global error pages or local error boundaries<br>Recovery flows, clearError, showError, or fallback UI |
| [Verification and Finish](./references/nuxt/rules/verification-finish.md) | Verify the intended framework behavior and re-check paired surfaces before concluding work. | The fix spans more than one surface<br>You are about to finish a Nuxt change and need to confirm the right abstraction |
| [Data Fetching and SSR](./references/nuxt/rules/data-fetching-ssr.md) | Deduplication, payload correctness, and request-safe loading. | Pages, layouts, or composables fetching initial data<br>SSR-visible content or hydration-sensitive state |
| [Hydration and SSR Consistency](./references/nuxt/rules/hydration-consistency.md) | SSR/CSR determinism, client-only boundaries, and mismatch prevention. | Hydration warnings or client-only rendering<br>State that differs between server and browser |
| [Architecture Boundaries](./references/nuxt/rules/architecture-boundaries.md) | Server-only secrets, request isolation, and safe shared abstractions. | Crossing server/client boundaries<br>Composable or utility architecture changes |
| [Server Routes and Runtime Config](./references/nuxt/rules/server-routes-runtime-config.md) | Runtime config exposure, env handling, and route-level contracts. | nuxt.config, runtime config, or env wiring<br>Server route config and public/private config exposure |
| [Nitro and h3 Server Patterns](./references/nuxt/rules/nitro-h3-patterns.md) | Handler contracts, caching, and edge-safe server behavior. | Server routes, middleware, Nitro plugins, or h3 handlers<br>API behavior, caching, or edge runtime concerns |
| [Plugins and Runtime Boot](./references/nuxt/rules/plugins.md) | Plugin ordering, startup cost, and app/runtime initialization. | Plugins, app boot logic, or injected runtime helpers<br>Global runtime behavior changes |
| [Performance and Rendering](./references/nuxt/rules/performance-rendering.md) | Rendering strategy, payload cost, and lazy loading tradeoffs. | Performance regressions or rendering strategy changes<br>Link, asset, and bundle cost decisions |
| [Module Authoring Conventions](./references/nuxt/rules/module-authoring.md) | Nuxt Kit patterns, module lifecycle, and ecosystem-safe authoring. | Writing or refactoring a Nuxt module<br>Module install/setup conventions |
| [Migrations and Compatibility](./references/nuxt/rules/migrations.md) | Incremental upgrades, compatibility boundaries, and rollout safety. | Upgrades, deprecations, or breaking behavior changes<br>Compatibility fixes across Nuxt versions |

## Module guides

Open the linked module entry first. Copied skills link straight to their `SKILL.md`; metadata-routed modules use a small docs/source router when no copied skill exists.

### Resolved module skills
- [@nuxt/ui](./references/modules/nuxt-ui/nuxt-ui/SKILL.md) `v4.5.1` - Resolved module skill. Trust: `official`. Build UIs with @nuxt/ui v4 — 125+ accessible Vue components with Tailwind CSS theming. Use when creating interfaces, customizing themes to match a brand, building forms, or composing layouts like dashboards, docs sites, and chat interfaces.

### Metadata-routed skills
- [@nuxthub/core](./references/modules/nuxthub-core/core/SKILL.md) `v0.10.5` - Metadata-routed skill. Trust: `official`. Build full-stack Nuxt applications, with zero configuration.
- [@onmax/nuxt-better-auth](./references/modules/onmax-nuxt-better-auth/nuxt-better-auth/SKILL.md) `v0.0.2-alpha.30` - Metadata-routed skill. Trust: `official`. Nuxt module for Better Auth integration with NuxtHub, route protection, session management, and role-based access

### Skipped or unavailable
- **@onmax/nuxt-better-auth** / `nuxt-better-auth` (`dist`): SKILL.md is required at skill root. Use the relevant Nuxt pack plus the module's official docs.




## Before Completion
- Did I choose a Nuxt primitive where a generic Vue or raw HTML solution would be tempting?
- Did I check whether the fix needs a second surface such as global or local, or server or client?
- Did I choose the right concept pair: page meta vs head, data collection vs page collection, component primitive vs custom markup?
- Did I verify the framework behavior that matters, not just the visible output?

## Primary Packs
Start with `Abstraction Disambiguation`, `Page Meta, Head, and Layout`, `Error Surfaces and Recovery`, `Verification and Finish`, `Data Fetching and SSR` when the task matches one of those common routes.

---

_Generated by nuxt-skill-hub. Do not edit this file manually._
