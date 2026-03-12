<script setup lang="ts">
import { api } from '#convex/api'

const message = ref('Hello, Convex!')
const delay = ref(1000)
const result = ref<string | null>(null)
const toast = useToast()

const { execute: runEcho, isPending, error } = useConvexAction(api.actions.echo)

async function handleRun() {
  result.value = null
  try {
    const data = await runEcho({ message: message.value, delay: delay.value })
    result.value = data
    toast.add({ title: 'Action completed', description: data, color: 'success' })
  }
  catch (err) {
    toast.add({ title: 'Action failed', description: (err as Error).message, color: 'error' })
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Basic Action -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-bolt" class="text-primary" />
          <span class="font-semibold">useConvexAction</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-4">
        Actions run server-side code that can call external APIs, have side effects, or perform long-running operations.
      </div>

      <div class="space-y-4">
        <UInput v-model="message" placeholder="Message to echo..." />

        <div class="flex items-center gap-4">
          <span class="text-sm text-muted">Delay:</span>
          <UInput v-model.number="delay" type="number" :min="0" :max="5000" :step="500" class="w-32" />
          <span class="text-xs text-muted">ms</span>
        </div>

        <UButton :loading="isPending" :disabled="!message.trim()" @click="handleRun">
          Run Echo Action
        </UButton>
      </div>
    </UCard>

    <!-- Loading State -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-clock" class="text-warning" />
          <span class="font-semibold">Long-running Operations</span>
        </div>
      </template>

      <div class="text-sm text-muted mb-4">
        Actions expose <code class="bg-muted px-1 rounded">isPending</code> for UI feedback during execution.
      </div>

      <div class="flex items-center gap-4">
        <span class="text-sm text-muted">isPending:</span>
        <UBadge :color="isPending ? 'warning' : 'neutral'" variant="subtle">
          {{ isPending }}
        </UBadge>
        <div v-if="isPending" class="flex items-center gap-2 text-muted">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin" />
          <span class="text-sm">Running action...</span>
        </div>
      </div>
    </UCard>

    <!-- Result -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-check-circle" class="text-success" />
          <span class="font-semibold">Action Result</span>
        </div>
      </template>

      <div v-if="result" class="p-4 rounded bg-success/10 border border-success/20">
        <p class="font-mono text-sm">
          {{ result }}
        </p>
      </div>
      <div v-else class="text-sm text-muted">
        Run an action to see the result here.
      </div>

      <UAlert v-if="error" color="error" :title="error.message" class="mt-4" />
    </UCard>

    <!-- Use Cases -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-light-bulb" class="text-info" />
          <span class="font-semibold">Action Use Cases</span>
        </div>
      </template>

      <ul class="text-sm text-muted space-y-2">
        <li class="flex items-start gap-2">
          <UIcon name="i-heroicons-check" class="text-success mt-0.5 shrink-0" />
          <span>Calling external APIs (payment processors, email services)</span>
        </li>
        <li class="flex items-start gap-2">
          <UIcon name="i-heroicons-check" class="text-success mt-0.5 shrink-0" />
          <span>Running computationally expensive operations</span>
        </li>
        <li class="flex items-start gap-2">
          <UIcon name="i-heroicons-check" class="text-success mt-0.5 shrink-0" />
          <span>Orchestrating multiple mutations</span>
        </li>
        <li class="flex items-start gap-2">
          <UIcon name="i-heroicons-check" class="text-success mt-0.5 shrink-0" />
          <span>Generating AI responses or processing media</span>
        </li>
      </ul>
    </UCard>
  </div>
</template>
