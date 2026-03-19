<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  submit: []
}>()
const model = defineModel<string>({ required: true })

const canSubmit = computed(() => !props.disabled && model.value.trim().length > 0)

function handleSubmit() {
  if (!canSubmit.value)
    return

  emit('submit')
}
</script>

<template>
  <form class="task-composer" @submit.prevent="handleSubmit">
    <label class="task-composer__field">
      <span class="task-composer__label">Write a task</span>
      <input
        v-model="model"
        class="task-composer__input"
        type="text"
        placeholder="Document the edge case, tighten the contract, ship the fix"
      >
    </label>

    <button class="task-composer__button" type="submit" :disabled="!canSubmit">
      {{ disabled ? 'Saving…' : 'Add task' }}
    </button>
  </form>
</template>

<style scoped>
.task-composer {
  display: grid;
  gap: 1rem;
}

.task-composer__field {
  display: grid;
  gap: 0.5rem;
}

.task-composer__label {
  color: var(--muted-strong);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.task-composer__input {
  appearance: none;
  background: hsla(0, 0%, 100%, 0.72);
  border: 1px solid var(--line);
  border-radius: 1rem;
  box-shadow: inset 0 1px 0 hsla(0, 0%, 100%, 0.75);
  color: var(--ink);
  font: inherit;
  min-height: 3.4rem;
  padding: 0 1rem;
}

.task-composer__input:focus-visible {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px hsla(14, 78%, 59%, 0.14);
  outline: none;
}

.task-composer__button {
  align-items: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  border: 0;
  border-radius: 999px;
  box-shadow: 0 18px 38px hsla(14, 78%, 42%, 0.18);
  color: white;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-weight: 600;
  gap: 0.5rem;
  justify-content: center;
  min-height: 3rem;
  padding: 0 1.25rem;
  transition:
    transform 160ms ease,
    opacity 160ms ease;
}

.task-composer__button:hover:enabled {
  transform: translateY(-1px);
}

.task-composer__button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
</style>
