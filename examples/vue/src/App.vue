<script setup lang="ts">
import { useConvexConnectionState } from '@onmax/convex-vue'
import { computed } from 'vue'
import TaskWorkspace from './components/TaskWorkspace.vue'
import UploadWorkspace from './components/UploadWorkspace.vue'
import { convexUrl, demoUserId } from './lib/convex'

const { isConnected } = useConvexConnectionState()
const hasConfiguration = computed(() => convexUrl.length > 0)
const connectionLabel = computed(() => {
  if (!hasConfiguration.value)
    return 'Missing VITE_CONVEX_URL'
  return isConnected.value ? 'Realtime connected' : 'Waiting for first connection'
})
</script>

<template>
  <main class="page-shell">
    <section class="hero-panel">
      <div class="hero-panel__copy">
        <p class="hero-panel__eyebrow">
          Standalone validation app
        </p>
        <h1 class="hero-panel__title">
          Prove the Vue package on its own.
        </h1>
        <p class="hero-panel__lede">
          This Vite app uses the supported `@onmax/convex-vue` entrypoints directly: root reads and writes for tasks, plus the storage feature entrypoint for uploads and reactive file URLs.
        </p>
      </div>

      <div class="hero-panel__meta-grid">
        <article class="meta-card">
          <p class="meta-card__label">
            Deployment
          </p>
          <p class="meta-card__value meta-card__value--mono">
            {{ convexUrl || 'Set VITE_CONVEX_URL to connect' }}
          </p>
        </article>

        <article class="meta-card">
          <p class="meta-card__label">
            User scope
          </p>
          <p class="meta-card__value meta-card__value--mono">
            {{ demoUserId }}
          </p>
        </article>

        <article class="meta-card">
          <p class="meta-card__label">
            Realtime state
          </p>
          <p class="meta-card__value">
            {{ connectionLabel }}
          </p>
        </article>
      </div>
    </section>

    <section v-if="hasConfiguration" class="workspace-grid">
      <TaskWorkspace :user-id="demoUserId" />
      <UploadWorkspace :user-id="demoUserId" />
    </section>

    <section v-else class="setup-panel">
      <p class="setup-panel__label">
        Quick start
      </p>
      <ol class="setup-panel__steps">
        <li>Run `npx convex dev` from the `playground/convex` directory.</li>
        <li>Start the example with `pnpm dev:vue`.</li>
        <li>Set `VITE_CONVEX_URL` and optionally `VITE_CONVEX_USER_ID` in your shell.</li>
      </ol>
      <p class="setup-panel__note">
        The app stays intentionally disconnected until you provide a real deployment URL, so the example remains honest about the package contract.
      </p>
    </section>
  </main>
</template>

<style scoped>
.page-shell {
  display: grid;
  gap: 1.5rem;
  margin: 0 auto;
  max-width: 1200px;
  min-height: 100vh;
  padding: 2rem 1.2rem 3rem;
}

.hero-panel {
  background:
    linear-gradient(160deg, hsla(0, 0%, 100%, 0.88), hsla(41, 60%, 93%, 0.84)),
    radial-gradient(circle at top right, hsla(14, 85%, 70%, 0.2), transparent 13rem);
  border: 1px solid var(--line);
  border-radius: 2rem;
  box-shadow: var(--shadow-lg);
  display: grid;
  gap: 2rem;
  padding: clamp(1.6rem, 3vw, 2.4rem);
}

.hero-panel__copy {
  display: grid;
  gap: 1rem;
  max-width: 48rem;
}

.hero-panel__eyebrow,
.setup-panel__label {
  color: var(--muted);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  margin: 0;
  text-transform: uppercase;
}

.hero-panel__title {
  font-family: var(--display-font);
  font-size: clamp(3rem, 7vw, 5.3rem);
  letter-spacing: -0.03em;
  line-height: 0.95;
  margin: 0;
  max-width: 12ch;
}

.hero-panel__lede,
.setup-panel__note {
  color: var(--muted-strong);
  font-size: 1.05rem;
  margin: 0;
  max-width: 60ch;
}

.hero-panel__meta-grid,
.workspace-grid {
  display: grid;
  gap: 1rem;
}

.hero-panel__meta-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.meta-card,
.setup-panel {
  background: hsla(0, 0%, 100%, 0.7);
  border: 1px solid var(--line);
  border-radius: 1.3rem;
  box-shadow: var(--shadow-sm);
  padding: 1rem 1.1rem;
}

.meta-card__label,
.meta-card__value {
  margin: 0;
}

.meta-card__label {
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.meta-card__value {
  font-size: 1rem;
}

.meta-card__value--mono {
  font-family: 'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace;
  font-size: 0.92rem;
}

.workspace-grid {
  align-items: start;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.setup-panel__steps {
  color: var(--muted-strong);
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0;
  padding-left: 1.25rem;
}

@media (max-width: 720px) {
  .page-shell {
    padding-top: 1.2rem;
  }

  .hero-panel__title {
    max-width: none;
  }
}
</style>
