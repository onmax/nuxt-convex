<script setup lang="ts">
const { isLoading, isAuthenticated } = useConvexAuth()
const { user } = useUserSession()
</script>

<template>
  <UDashboardPanel id="auth">
    <template #header>
      <UDashboardNavbar title="Auth Components">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UBadge :color="isAuthenticated ? 'success' : 'warning'" variant="subtle">
            {{ isAuthenticated ? 'Authenticated' : isLoading ? 'Loading' : 'Unauthenticated' }}
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-8">
        <!-- Raw state -->
        <section class="space-y-4">
          <h3 class="font-semibold text-highlighted">
            useConvexAuth() state
          </h3>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-md border border-default bg-elevated/50 px-4 py-3">
              <p class="text-xs text-dimmed">
                isLoading
              </p>
              <p class="mt-1 text-sm font-medium text-highlighted">
                {{ isLoading }}
              </p>
            </div>
            <div class="rounded-md border border-default bg-elevated/50 px-4 py-3">
              <p class="text-xs text-dimmed">
                isAuthenticated
              </p>
              <p class="mt-1 text-sm font-medium text-highlighted">
                {{ isAuthenticated }}
              </p>
            </div>
          </div>
        </section>

        <!-- Component demos -->
        <section class="space-y-4">
          <h3 class="font-semibold text-highlighted">
            Renderless auth components
          </h3>

          <div class="space-y-3">
            <div class="rounded-md border border-default bg-elevated/50 px-4 py-3">
              <p class="mb-2 text-xs font-medium text-dimmed">
                &lt;ConvexAuthLoading&gt;
              </p>
              <ConvexAuthLoading>
                <div class="flex items-center gap-2 text-sm text-muted">
                  <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
                  Checking authentication...
                </div>
              </ConvexAuthLoading>
              <p v-if="!isLoading" class="text-xs text-dimmed italic">
                (not loading)
              </p>
            </div>

            <div class="rounded-md border border-default bg-elevated/50 px-4 py-3">
              <p class="mb-2 text-xs font-medium text-dimmed">
                &lt;ConvexAuthenticated&gt;
              </p>
              <ConvexAuthenticated>
                <div class="flex items-center gap-2 text-sm text-highlighted">
                  <UIcon name="i-lucide-check-circle" class="size-4 text-success" />
                  Authenticated as {{ user?.name || user?.email }}
                </div>
              </ConvexAuthenticated>
              <p v-if="!isAuthenticated" class="text-xs text-dimmed italic">
                (not authenticated)
              </p>
            </div>

            <div class="rounded-md border border-default bg-elevated/50 px-4 py-3">
              <p class="mb-2 text-xs font-medium text-dimmed">
                &lt;ConvexUnauthenticated&gt;
              </p>
              <ConvexUnauthenticated>
                <div class="flex items-center gap-2 text-sm text-warning">
                  <UIcon name="i-lucide-shield-off" class="size-4" />
                  Not authenticated
                </div>
              </ConvexUnauthenticated>
              <p v-if="isAuthenticated || isLoading" class="text-xs text-dimmed italic">
                (authenticated or loading)
              </p>
            </div>
          </div>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
