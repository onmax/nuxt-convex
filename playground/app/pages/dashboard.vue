<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const runtimeConfig = useRuntimeConfig()
const convex = runtimeConfig.public.convex as {
  url?: string
  server?: boolean
  storage?: boolean
  r2?: boolean
} | undefined

const sections = [
  {
    id: 'tasks',
    icon: 'i-heroicons-list-bullet',
    title: 'Tasks',
    description: 'CRUD with realtime queries, mutations, and pagination.',
  },
  {
    id: 'storage',
    icon: 'i-heroicons-cloud-arrow-up',
    title: 'Convex Storage',
    description: 'Upload, preview, and delete files via Convex storage.',
  },
  {
    id: 'r2',
    icon: 'i-simple-icons-cloudflare',
    title: 'Cloudflare R2',
    description: 'Upload to R2 with metadata synced through Convex.',
  },
  {
    id: 'diagnostics',
    icon: 'i-heroicons-shield-check',
    title: 'Session & Diagnostics',
    description: 'Auth state, connection status, and runtime config.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-default">
    <div class="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 sm:py-10">
      <AppHeader show-user />

      <section class="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <UCard class="border-default/70 shadow-sm">
          <div class="space-y-5">
            <div class="space-y-3">
              <p class="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                Dashboard
              </p>
              <h1 class="max-w-2xl text-4xl font-semibold text-highlighted sm:text-5xl">
                Nuxt + Convex playground.
              </h1>
              <p class="max-w-2xl text-base text-muted sm:text-lg">
                Tasks, file storage, R2 uploads, and auth — all wired up and working.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <UBadge color="primary" variant="subtle">
                Email/password auth
              </UBadge>
              <UBadge v-if="runtimeConfig.public.enableGitHubAuth" color="neutral" variant="subtle">
                GitHub auth enabled
              </UBadge>
              <UBadge color="neutral" variant="subtle">
                Convex URL: {{ convex?.url || 'missing' }}
              </UBadge>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <UButton
                v-for="section in sections"
                :key="section.id"
                :icon="section.icon"
                :label="section.title"
                :to="`#${section.id}`"
                color="neutral"
                variant="outline"
                class="justify-start"
              />
            </div>
          </div>
        </UCard>

        <UCard class="border-default/70 bg-default/80 shadow-sm">
          <div class="space-y-5">
            <div class="space-y-2">
              <h2 class="text-xl font-semibold text-highlighted">
                Current module switches
              </h2>
              <p class="text-sm text-muted">
                Current module configuration.
              </p>
            </div>

            <dl class="grid gap-3 text-sm sm:grid-cols-2">
              <div class="rounded-2xl border border-default/60 bg-default/70 p-4">
                <dt class="text-dimmed">
                  `convex.server`
                </dt>
                <dd class="mt-2 font-medium text-highlighted">
                  {{ convex?.server ? 'true' : 'false' }}
                </dd>
              </div>
              <div class="rounded-2xl border border-default/60 bg-default/70 p-4">
                <dt class="text-dimmed">
                  `convex.storage`
                </dt>
                <dd class="mt-2 font-medium text-highlighted">
                  {{ convex?.storage ? 'true' : 'false' }}
                </dd>
              </div>
              <div class="rounded-2xl border border-default/60 bg-default/70 p-4">
                <dt class="text-dimmed">
                  `convex.r2`
                </dt>
                <dd class="mt-2 font-medium text-highlighted">
                  {{ convex?.r2 ? 'true' : 'false' }}
                </dd>
              </div>
              <div class="rounded-2xl border border-default/60 bg-default/70 p-4">
                <dt class="text-dimmed">
                  Optional GitHub auth
                </dt>
                <dd class="mt-2 font-medium text-highlighted">
                  {{ runtimeConfig.public.enableGitHubAuth ? 'enabled' : 'disabled' }}
                </dd>
              </div>
            </dl>
          </div>
        </UCard>
      </section>

      <ClientOnly>
        <div class="space-y-8">
          <section id="tasks">
            <HarnessTaskValidationWorkspace />
          </section>

          <section id="storage">
            <HarnessStorageValidationWorkspace />
          </section>

          <section id="r2">
            <HarnessR2ValidationWorkspace />
          </section>

          <section id="diagnostics">
            <HarnessSessionDiagnosticsPanel />
          </section>
        </div>

        <template #fallback>
          <div class="flex justify-center py-16">
            <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-muted" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
