<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const convex = runtimeConfig.public.convex as {
  url?: string
  server?: boolean
  storage?: boolean
  r2?: boolean
} | undefined

const { user, ready } = useUserSession()
const { state, isConnected } = useConvexConnectionState()

const diagnostics = computed(() => [
  {
    label: 'Supported auth path',
    value: 'Email/password',
    detail: 'This is the canonical Better Auth flow that the playground validates.',
  },
  {
    label: 'Optional GitHub provider',
    value: runtimeConfig.public.enableGitHubAuth ? 'Enabled' : 'Disabled',
    detail: 'GitHub can stay available behind environment flags, but it is not the supported baseline.',
  },
  {
    label: 'Convex connection',
    value: state.value || 'connecting',
    detail: isConnected.value ? 'The realtime client is currently connected.' : 'The realtime client is still reconnecting or waiting for the browser.',
  },
  {
    label: 'Public Convex URL',
    value: convex?.url || 'Missing',
    detail: 'The Nuxt module exposes this value through `runtimeConfig.public.convex.url`.',
  },
])
</script>

<template>
  <UCard class="border-default/70 shadow-sm">
    <template #header>
      <div class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div class="space-y-2">
          <p class="text-sm font-medium uppercase tracking-[0.24em] text-primary">
            Session &amp; Diagnostics
          </p>
          <h2 class="text-2xl font-semibold text-highlighted">
            Confirm the supported auth boundary and the current runtime state.
          </h2>
          <p class="max-w-2xl text-sm text-muted">
            This section keeps the Better Auth story honest: email/password is the supported path, GitHub is optional, and the Nuxt runtime surface stays explicit.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UBadge :color="isConnected ? 'success' : 'warning'" variant="subtle">
            {{ isConnected ? 'Convex connected' : 'Convex connecting' }}
          </UBadge>
          <UBadge color="neutral" variant="subtle">
            `convex.server = {{ convex?.server ? 'true' : 'false' }}`
          </UBadge>
        </div>
      </div>
    </template>

    <div class="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div class="rounded-3xl border border-default/60 bg-default/70 p-5">
        <div class="space-y-4">
          <div class="space-y-2">
            <h3 class="font-semibold text-highlighted">
              Current session
            </h3>
            <p class="text-sm text-muted">
              The dashboard is route-protected. The session snapshot below comes from the Nuxt Better Auth client.
            </p>
          </div>

          <div v-if="ready && user" class="space-y-3">
            <div class="flex items-center gap-3">
              <UAvatar :src="user.image" :alt="user.name" size="lg" />
              <div>
                <p class="font-medium text-highlighted">
                  {{ user.name }}
                </p>
                <p class="text-sm text-muted">
                  {{ user.email }}
                </p>
              </div>
            </div>

            <dl class="space-y-2 text-sm">
              <div class="rounded-2xl border border-default/60 bg-default/80 px-4 py-3">
                <dt class="text-dimmed">
                  User id
                </dt>
                <dd class="mt-1 break-all font-medium text-highlighted">
                  {{ user.id }}
                </dd>
              </div>
              <div class="rounded-2xl border border-default/60 bg-default/80 px-4 py-3">
                <dt class="text-dimmed">
                  Playground site URL
                </dt>
                <dd class="mt-1 break-all font-medium text-highlighted">
                  {{ runtimeConfig.public.siteUrl }}
                </dd>
              </div>
            </dl>
          </div>

          <div v-else class="rounded-2xl border border-default/60 bg-default/80 px-4 py-5 text-sm text-muted">
            Waiting for the Better Auth client session to resolve...
          </div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div
          v-for="item in diagnostics"
          :key="item.label"
          class="rounded-3xl border border-default/60 bg-default/70 p-5"
        >
          <p class="text-xs uppercase tracking-[0.18em] text-dimmed">
            {{ item.label }}
          </p>
          <p class="mt-3 text-lg font-semibold text-highlighted">
            {{ item.value }}
          </p>
          <p class="mt-2 text-sm text-muted">
            {{ item.detail }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
