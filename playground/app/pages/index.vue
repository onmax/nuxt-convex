<script setup lang="ts">
import { parseBooleanFlag } from '../../utils/playground-env'

definePageMeta({ layout: false, middleware: 'guest' })

type AuthTab = 'sign-in' | 'sign-up'

const toast = useToast()
const runtimeConfig = useRuntimeConfig()
const { user, waitForSession } = useUserSession()
const signInWithEmail = useSignIn('email')
const signUpWithEmail = useSignUp('email')
const signInWithSocial = useSignIn('social')
const enableGitHubAuth = parseBooleanFlag(runtimeConfig.public.enableGitHubAuth, false)

const authTabs: Array<{ label: string, value: AuthTab, icon: string }> = [
  { label: 'Sign in', value: 'sign-in', icon: 'i-lucide-log-in' },
  { label: 'Create account', value: 'sign-up', icon: 'i-lucide-user-plus' },
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

const isSignInPending = computed(() => signInWithEmail.status.value === 'pending')
const isSignUpPending = computed(() => signUpWithEmail.status.value === 'pending')
const isGitHubPending = computed(() => signInWithSocial.status.value === 'pending')
const authDescription = computed(() => enableGitHubAuth
  ? 'Sign in with email or GitHub.'
  : 'Sign in with email and password.')

const features = [
  { icon: 'i-lucide-list-todo', title: 'Tasks', description: 'Create, delete, and paginate tasks with realtime updates.' },
  { icon: 'i-lucide-cloud-upload', title: 'Storage', description: 'Upload, preview, and delete files via Convex storage.' },
  { icon: 'i-simple-icons-cloudflare', title: 'Cloudflare R2', description: 'Upload to R2 with metadata synced through Convex.' },
  { icon: 'i-lucide-settings', title: 'Settings', description: 'Auth state, connection status, and runtime config.' },
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

  if (signInWithEmail.error.value) {
    toast.add({
      color: 'error',
      title: 'Sign in failed',
      description: signInWithEmail.error.value.message || 'Please try again.',
    })
    return
  }

  if (signInWithEmail.status.value === 'success')
    await finishAuthFlow()
}

async function submitSignUp() {
  await signUpWithEmail.execute({
    email: signUpForm.email,
    name: signUpForm.name,
    password: signUpForm.password,
  })

  if (signUpWithEmail.error.value) {
    toast.add({
      color: 'error',
      title: 'Sign up failed',
      description: signUpWithEmail.error.value.message || 'Please try again.',
    })
    return
  }

  if (signUpWithEmail.status.value === 'success') {
    signInForm.email = signUpForm.email
    signInForm.password = signUpForm.password
    await finishAuthFlow()
  }
}

async function signInWithGitHub() {
  await signInWithSocial.execute({ provider: 'github' })

  if (signInWithSocial.error.value) {
    toast.add({
      color: 'error',
      title: 'GitHub sign in failed',
      description: signInWithSocial.error.value.message || 'Please try again.',
    })
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-default">
    <header class="flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-3">
        <UIcon name="i-simple-icons-nuxtdotjs" class="size-5 text-[var(--color-nuxt)]" />
        <span class="text-sm text-muted">+</span>
        <UIcon name="i-custom-convex" class="size-4 text-[var(--color-convex-500)]" />
      </div>
      <div class="flex items-center gap-2">
        <UButton to="https://nuxt-convex.onmax.me" target="_blank" variant="ghost" color="neutral" size="sm">
          Docs
        </UButton>
        <UButton to="https://github.com/onmax/nuxt-convex" target="_blank" icon="i-simple-icons-github" variant="ghost" color="neutral" size="sm" />
      </div>
    </header>

    <div class="flex-1 px-6 py-10 sm:py-14">
      <div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section class="space-y-8">
          <div class="flex items-center gap-4">
            <UIcon name="i-simple-icons-nuxtdotjs" class="size-12 text-[var(--color-nuxt)]" />
            <span class="text-2xl text-muted">+</span>
            <UIcon name="i-custom-convex" class="size-10 text-[var(--color-convex-500)]" />
          </div>

          <div class="space-y-4">
            <p class="text-sm font-medium uppercase tracking-[0.24em] text-primary">
              Playground
            </p>
            <h1 class="max-w-xl text-5xl font-bold text-highlighted sm:text-6xl">
              Nuxt + Convex in action.
            </h1>
            <p class="max-w-xl text-lg text-muted">
              Sign in and explore tasks, file storage, R2 uploads, and auth — all powered by Convex.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
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
                  {{ authDescription }}
                </p>
              </div>

              <UTabs v-model="activeTab" :items="authTabs">
                <template #content="{ item }">
                  <form
                    v-if="item.value === 'sign-in'"
                    class="mt-6 space-y-4"
                    @submit.prevent="submitSignIn"
                  >
                    <UFormField label="Email" required>
                      <UInput v-model="signInForm.email" type="email" placeholder="you@example.com" size="xl" />
                    </UFormField>

                    <UFormField label="Password" required>
                      <UInput v-model="signInForm.password" type="password" placeholder="Enter your password" size="xl" />
                    </UFormField>

                    <UButton type="submit" color="primary" size="xl" block :loading="isSignInPending">
                      Sign in
                    </UButton>
                  </form>

                  <form
                    v-else
                    class="mt-6 space-y-4"
                    @submit.prevent="submitSignUp"
                  >
                    <UFormField label="Name" required>
                      <UInput v-model="signUpForm.name" placeholder="Your name" size="xl" />
                    </UFormField>

                    <UFormField label="Email" required>
                      <UInput v-model="signUpForm.email" type="email" placeholder="you@example.com" size="xl" />
                    </UFormField>

                    <UFormField label="Password" required>
                      <UInput v-model="signUpForm.password" type="password" placeholder="Choose a password" size="xl" />
                    </UFormField>

                    <UButton type="submit" color="primary" size="xl" block :loading="isSignUpPending">
                      Create account
                    </UButton>
                  </form>
                </template>
              </UTabs>

              <template v-if="enableGitHubAuth">
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
                  :loading="isGitHubPending"
                  @click="signInWithGitHub"
                >
                  Continue with GitHub
                </UButton>
              </template>
            </div>
          </UCard>
        </section>
      </div>
    </div>
  </div>
</template>
