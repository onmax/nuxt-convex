<script setup lang="ts">
import type { TaskDoc, TaskId } from '../lib/model'
import { computed } from 'vue'
import { formatRelativeTime } from '../lib/format'

const props = defineProps<{
  deletingId: TaskId | null
  errorMessage: string | null
  isPending: boolean
  tasks: TaskDoc[]
}>()

const emit = defineEmits<{
  remove: [id: TaskId]
}>()

const isEmpty = computed(() => !props.isPending && props.tasks.length === 0)

function handleRemove(id: TaskId) {
  emit('remove', id)
}
</script>

<template>
  <div class="task-list">
    <p v-if="isPending" class="task-list__state">
      Syncing the current task set…
    </p>

    <p v-else-if="errorMessage" class="task-list__error">
      {{ errorMessage }}
    </p>

    <p v-else-if="isEmpty" class="task-list__state">
      No tasks yet. Add one above to prove the standalone mutation flow.
    </p>

    <ul v-else class="task-list__items">
      <li v-for="task in tasks" :key="task._id" class="task-list__item">
        <div class="task-list__copy">
          <p class="task-list__title">
            {{ task.title }}
          </p>
          <p class="task-list__meta">
            Added {{ formatRelativeTime(task.createdAt) }}
          </p>
        </div>

        <button
          class="task-list__button"
          type="button"
          :disabled="deletingId === task._id"
          @click="handleRemove(task._id)"
        >
          {{ deletingId === task._id ? 'Removing…' : 'Remove' }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.task-list {
  display: grid;
  gap: 0.85rem;
}

.task-list__state,
.task-list__error {
  background: hsla(43, 36%, 94%, 0.82);
  border: 1px solid var(--line);
  border-radius: 1rem;
  color: var(--muted);
  margin: 0;
  padding: 1rem 1.1rem;
}

.task-list__error {
  border-color: hsla(6, 68%, 58%, 0.28);
  color: hsl(6, 52%, 38%);
}

.task-list__items {
  display: grid;
  gap: 0.85rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.task-list__item {
  align-items: center;
  background: hsla(0, 0%, 100%, 0.78);
  border: 1px solid var(--line);
  border-radius: 1.2rem;
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr) auto;
  padding: 1rem 1.1rem;
}

.task-list__copy {
  display: grid;
  gap: 0.35rem;
}

.task-list__title {
  margin: 0;
}

.task-list__meta {
  color: var(--muted);
  margin: 0;
  font-size: 0.92rem;
}

.task-list__button {
  background: transparent;
  border: 1px solid hsla(12, 27%, 62%, 0.4);
  border-radius: 999px;
  color: var(--muted-strong);
  cursor: pointer;
  font: inherit;
  min-height: 2.5rem;
  padding: 0 0.95rem;
}

.task-list__button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 640px) {
  .task-list__item {
    grid-template-columns: 1fr;
  }
}
</style>
