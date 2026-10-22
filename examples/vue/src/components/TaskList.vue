<script setup lang="ts">
import type { QueryStatus } from 'vue-convex'
import type { TaskDoc, TaskId } from '../lib/model'
import { formatRelativeTime } from '../lib/format'

defineProps<{
  busyId: TaskId | null
  errorMessage: string | null
  status: QueryStatus
  tasks: TaskDoc[]
}>()

const emit = defineEmits<{
  toggle: [id: TaskId]
  remove: [id: TaskId]
}>()
</script>

<template>
  <div class="task-list">
    <p v-if="errorMessage" class="task-list__error" role="alert">
      {{ errorMessage }}
    </p>

    <p v-if="status === 'pending'" class="task-list__state">
      Loading tasks over the WebSocket…
    </p>

    <p v-else-if="status === 'success' && tasks.length === 0" class="task-list__state">
      No tasks yet. Add one above, then open this page in a second tab to watch it sync.
    </p>

    <ul v-else-if="status === 'success'" class="task-list__items">
      <li v-for="task in tasks" :key="task._id" class="task-list__item" :class="{ 'task-list__item--done': task.isCompleted }">
        <label class="task-list__copy">
          <input
            class="task-list__check"
            type="checkbox"
            :checked="task.isCompleted"
            :disabled="busyId === task._id"
            @change="emit('toggle', task._id)"
          >
          <span>
            <span class="task-list__title">{{ task.title }}</span>
            <span class="task-list__meta">Added {{ formatRelativeTime(task.createdAt) }}</span>
          </span>
        </label>

        <button
          class="task-list__button"
          type="button"
          :disabled="busyId === task._id"
          @click="emit('remove', task._id)"
        >
          Remove
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
  align-items: start;
  cursor: pointer;
  display: flex;
  gap: 0.8rem;
}

.task-list__copy > span {
  display: grid;
  gap: 0.35rem;
}

.task-list__check {
  accent-color: var(--accent);
  height: 1.1rem;
  margin: 0.2rem 0 0;
  width: 1.1rem;
}

.task-list__item--done .task-list__title {
  color: var(--muted);
  text-decoration: line-through;
}

.task-list__title {
  display: block;
}

.task-list__meta {
  color: var(--muted);
  display: block;
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
