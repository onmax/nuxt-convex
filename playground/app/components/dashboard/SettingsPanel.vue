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

const moduleConfig = computed(() => [
  { label: 'convex.server', value: convex?.server ? 'true' : 'false' },
  { label: 'convex.storage', value: convex?.storage ? 'true' : 'false' },
  { label: 'convex.r2', value: convex?.r2 ? 'true' : 'false' },
  { label: 'GitHub auth', value: runtimeConfig.public.enableGitHubAuth ? 'enabled' : 'disabled' },
])

const diagnostics = computed(() => [
  { label: 'Auth path', value: 'Email/password', detail: 'Better Auth with Convex adapter' },
  { label: 'GitHub provider', value: runtimeConfig.public.enableGitHubAuth ? 'Enabled' : 'Disabled', detail: 'Optional, behind env flag' },
  { label: 'Connection', value: state.value || 'connecting', detail: isConnected.value ? 'Realtime client connected' : 'Reconnecting...' },
  { label: 'Convex URL', value: convex?.url || 'Missing', detail: 'runtimeConfig.public.convex.url' },
])
</script>

<template>
  <UDashboardPanel id="settings">
    <template #header>
      <UDashboardNavbar title="Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UBadge :color="isConnected ? 'success' : 'warning'" variant="subtle">
            {{ isConnected ? 'Connected' : 'Connecting' }}
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-8">
        <!-- Session -->
        <section class="space-y-4">
          <h3 class="font-semibold text-highlighted">
            Current session
          </h3>

          <div v-if="ready && user" class="space-y-4">
            <div class="flex items-center gap-3">
              <UAvatar :src="user.image || undefined" :alt="user.name" size="lg" />
              <div>
                <p class="font-medium text-highlighted">
                  {{ user.name }}
                </p>
                <p class="text-sm text-muted">
                  {{ user.email }}
                </p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-md border border-default bg-elevated/50 px-4 py-3">
                <p class="text-xs text-dimmed">
                  User ID
                </p>
                <p class="mt-1 break-all text-sm font-medium text-highlighted">
                  {{ user.id }}
                </p>
              </div>
              <div class="rounded-md border border-default bg-elevated/50 px-4 py-3">
                <p class="text-xs text-dimmed">
                  Site URL
                </p>
                <p class="mt-1 break-all text-sm font-medium text-highlighted">
                  {{ runtimeConfig.public.siteUrl }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="rounded-md border border-default bg-elevated/50 px-4 py-5 text-sm text-muted">
            Waiting for session...
          </div>
        </section>

        <!-- Module config -->
        <section class="space-y-4">
          <h3 class="font-semibold text-highlighted">
            Module configuration
          </h3>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="item in moduleConfig" :key="item.label" class="rounded-md border border-default bg-elevated/50 px-4 py-3">
              <p class="text-xs text-dimmed">
                {{ item.label }}
              </p>
              <p class="mt-1 text-sm font-medium text-highlighted">
                {{ item.value }}
              </p>
            </div>
          </div>
        </section>

        <!-- Diagnostics -->
        <section class="space-y-4">
          <h3 class="font-semibold text-highlighted">
            Diagnostics
          </h3>

          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="item in diagnostics" :key="item.label" class="rounded-md border border-default bg-elevated/50 px-4 py-3">
              <p class="text-xs text-dimmed">
                {{ item.label }}
              </p>
              <p class="mt-2 text-sm font-semibold text-highlighted">
                {{ item.value }}
              </p>
              <p class="mt-1 text-xs text-muted">
                {{ item.detail }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
