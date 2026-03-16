---
name: "nuxt"
description: "Always-on Nuxt disambiguation layer for this project. Use it to choose the right Nuxt pack first, then load module delta skills only when needed."
---

# Nuxt Skill Index

This file keeps the highest-frequency Nuxt decisions in context.
Use it to avoid generic Vue fallbacks, then route into the smallest matching pack.

## Monorepo Scope
This skill applies only to the `playground` subtree of this monorepo.
Treat files and tasks outside `playground` as out of scope unless the user explicitly redirects you there.



## Activation Flow
1. Explore the project first: inspect the real page, component, route, server handler, collection, or module surface you are changing.
2. Open [references/index.md](./references/index.md) and load the smallest matching core pack.
3. If module authoring is part of the task, load [Module Authoring Conventions](./references/core/rules/module-authoring.md) before changing `defineNuxtModule`, runtime extensions, hooks, or release scaffolding.
4. If an installed module owns the problem, read its wrapper under [references/modules](./references/modules) before the copied module `SKILL.md`.
5. Apply module guidance as delta-only rules inside that module's APIs, config, runtime behavior, and owned files.

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
- If the task is module-specific, use the module wrapper and keep module guidance scoped; do not replace broad Nuxt rules with module-specific rules.

## Precedence
- Repository-global instructions and required workflows win first.
- This file keeps the common Nuxt forks in context.
- Core packs provide deeper Nuxt guidance.
- Module wrappers add delta-only guidance inside explicit module scope.

## Before Completion
- Did I choose a Nuxt primitive where a generic Vue or raw HTML solution would be tempting?
- Did I check whether the fix needs a second surface such as global or local, or server or client?
- Did I choose the right concept pair: page meta vs head, data collection vs page collection, component primitive vs custom markup?
- Did I verify the framework behavior that matters, not just the visible output?

## Core Packs
Start with the relevant pack in [references/index.md](./references/index.md). Primary packs include `Abstraction Disambiguation`, `Page Meta, Head, and Layout`, `Error Surfaces and Recovery`, `Content Modeling and Navigation`, `Nuxt UI Primitives`.
