<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

type AuthTab = 'sign-in' | 'sign-up'

const { user, waitForSession } = useUserSession()
const signInWithEmail = useSignIn('email')
const signUpWithEmail = useSignUp('email')
const signInWithSocial = useSignIn('social')

const authTabs: Array<{ label: string, value: AuthTab, icon: string }> = [
  { label: 'Sign in', value: 'sign-in', icon: 'i-heroicons-arrow-right-end-on-rectangle' },
  { label: 'Create account', value: 'sign-up', icon: 'i-heroicons-user-plus' },
]

const activeTab = ref<AuthTab>('sign-in')

const signInForm = reactive({
  email: 'demo@nuxt-convex.dev',
  password: 'password123',
})

const signUpForm = reactive({
  name: 'Convex Builder',
  email: '',
  password: '',
})

const signInPending = computed(() => signInWithEmail.status.value === 'pending')
const signUpPending = computed(() => signUpWithEmail.status.value === 'pending')
const githubPending = computed(() => signInWithSocial.status.value === 'pending')
const signInError = computed(() => signInWithEmail.error.value?.message || null)
const signUpError = computed(() => signUpWithEmail.error.value?.message || null)
const githubError = computed(() => signInWithSocial.error.value?.message || null)

const features = [
  { icon: 'i-heroicons-bolt', title: 'Realtime', description: 'Live subscriptions sync data instantly across all clients' },
  { icon: 'i-heroicons-cloud-arrow-up', title: 'File Storage', description: 'Upload files directly to Convex with NuxtHub' },
  { icon: 'i-heroicons-shield-check', title: 'Email + Password', description: 'Basic Better Auth flows on top of Convex' },
]

async function finishAuthFlow() {
  await waitForSession()
  if (user.value)
    await navigateTo('/dashboard')
}

async function submitSignIn() {
  await signInWithEmail.execute({
    email: signInForm.email,
    password: signInForm.password,
  })

  if (signInWithEmail.status.value === 'success')
    await finishAuthFlow()
}

async function submitSignUp() {
  await signUpWithEmail.execute({
    email: signUpForm.email,
    name: signUpForm.name,
    password: signUpForm.password,
  })

  if (signUpWithEmail.status.value === 'success') {
    signInForm.email = signUpForm.email
    signInForm.password = signUpForm.password
    await finishAuthFlow()
  }
}

async function signInWithGitHub() {
  await signInWithSocial.execute({ provider: 'github' })
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-default">
    <AppHeader />

    <div class="flex-1 px-6 py-10 sm:py-14">
      <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section class="space-y-8">
          <div class="flex items-center gap-4">
            <UIcon name="i-simple-icons-nuxtdotjs" class="size-12 text-nuxt" />
            <span class="text-2xl text-muted">+</span>
            <UIcon name="i-custom-convex" class="size-10 text-convex" />
          </div>

          <div class="space-y-4">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-primary">
              Better Auth Playground
            </p>
            <h1 class="max-w-xl text-5xl font-bold text-highlighted sm:text-6xl">
              Email and password on top of Convex.
            </h1>
            <p class="max-w-xl text-lg text-muted">
              This playground tracks the current branch setup: layer-aware module defaults, Convex-backed Better Auth, and a basic credential flow that works out of the box.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <UCard v-for="feature in features" :key="feature.title" class="border-default/60 bg-default/70">
              <div class="flex flex-col gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <UIcon :name="feature.icon" class="size-5 text-primary" />
                </div>
                <h3 class="font-semibold text-highlighted">
                  {{ feature.title }}
                </h3>
                <p class="text-sm text-muted">
                  {{ feature.description }}
                </p>
              </div>
            </UCard>
          </div>

          <p class="text-xs text-dimmed">
            Demo data auto-deletes after 24h.
          </p>
        </section>

        <section>
          <UCard class="border-default/70 shadow-sm">
            <div class="space-y-6">
              <div class="space-y-2">
                <h2 class="text-2xl font-semibold text-highlighted">
                  Access the dashboard
                </h2>
                <p class="text-sm text-muted">
                  Use email/password first. GitHub stays available as a secondary provider.
                </p>
              </div>

              <UTabs v-model="activeTab" :items="authTabs">
                <template #content="{ item }">
                  <form
                    v-if="item.value === 'sign-in'"
                    class="mt-6 space-y-4"
                    @submit.prevent="submitSignIn"
                  >
                    <UAlert v-if="signInError" color="error" variant="soft" :title="signInError" />

                    <UFormField label="Email" required>
                      <UInput v-model="signInForm.email" type="email" placeholder="you@example.com" size="xl" />
                    </UFormField>

                    <UFormField label="Password" required>
                      <UInput v-model="signInForm.password" type="password" placeholder="Enter your password" size="xl" />
                    </UFormField>

                    <UButton type="submit" color="primary" size="xl" block :loading="signInPending">
                      Sign in
                    </UButton>
                  </form>

                  <form
                    v-else
                    class="mt-6 space-y-4"
                    @submit.prevent="submitSignUp"
                  >
                    <UAlert v-if="signUpError" color="error" variant="soft" :title="signUpError" />

                    <UFormField label="Name" required>
                      <UInput v-model="signUpForm.name" placeholder="Your name" size="xl" />
                    </UFormField>

                    <UFormField label="Email" required>
                      <UInput v-model="signUpForm.email" type="email" placeholder="you@example.com" size="xl" />
                    </UFormField>

                    <UFormField label="Password" required>
                      <UInput v-model="signUpForm.password" type="password" placeholder="Choose a password" size="xl" />
                    </UFormField>

                    <UButton type="submit" color="primary" size="xl" block :loading="signUpPending">
                      Create account
                    </UButton>
                  </form>
                </template>
              </UTabs>

              <div class="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-dimmed">
                <span class="h-px flex-1 bg-default" />
                <span>Secondary</span>
                <span class="h-px flex-1 bg-default" />
              </div>

              <UButton
                size="lg"
                color="neutral"
                variant="soft"
                block
                icon="i-simple-icons-github"
                :loading="githubPending"
                @click="signInWithGitHub"
              >
                Continue with GitHub
              </UButton>

              <UAlert v-if="githubError" color="error" variant="soft" :title="githubError" />
            </div>
          </UCard>
        </section>
      </div>
    </div>
  </div>
</template>
