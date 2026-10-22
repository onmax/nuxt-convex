<script setup lang="ts">
import { useTaskWorkspace } from '../composables/useTaskWorkspace'
import TaskComposer from './TaskComposer.vue'
import TaskList from './TaskList.vue'

const { busyId, draftTitle, errorMessage, isAdding, remaining, removeTask, status, submitTask, tasks, toggleTask } = useTaskWorkspace()
</script>

<template>
  <section class="workspace-card">
    <div class="workspace-card__header">
      <div>
        <p class="workspace-card__eyebrow">
          Query + Mutations
        </p>
        <h2 class="workspace-card__title">
          Task board
        </h2>
      </div>

      <p class="workspace-card__count">
        {{ remaining }} open of {{ tasks.length }}
      </p>
    </div>

    <TaskComposer v-model="draftTitle" :disabled="isAdding" @submit="submitTask" />
    <TaskList
      :busy-id="busyId"
      :error-message="errorMessage"
      :status="status"
      :tasks="tasks"
      @toggle="toggleTask"
      @remove="removeTask"
    />
  </section>
</template>

<style scoped>
.workspace-card {
  background: linear-gradient(180deg, hsla(0, 0%, 100%, 0.88), hsla(43, 53%, 96%, 0.82));
  border: 1px solid var(--line);
  border-radius: 1.6rem;
  box-shadow: var(--shadow-lg);
  display: grid;
  gap: 1.4rem;
  padding: 1.4rem;
}

.workspace-card__header {
  align-items: end;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.workspace-card__eyebrow {
  color: var(--muted);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  margin: 0 0 0.45rem;
  text-transform: uppercase;
}

.workspace-card__title {
  font-family: var(--display-font);
  font-size: clamp(1.9rem, 2.3vw, 2.5rem);
  line-height: 1;
  margin: 0;
}

.workspace-card__count {
  background: hsla(43, 36%, 92%, 0.9);
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted-strong);
  margin: 0;
  padding: 0.55rem 0.8rem;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .workspace-card__header {
    align-items: start;
    flex-direction: column;
  }
}
</style>
