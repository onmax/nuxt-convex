<script setup lang="ts">
import { useUploadWorkspace } from '../composables/useUploadWorkspace'
import { formatBytes } from '../lib/format'
import UploadPreviewCard from './UploadPreviewCard.vue'

const props = defineProps<{
  userId: string
}>()

const {
  deletingId,
  error,
  isPending,
  removeUploadById,
  selectFile,
  selectedFile,
  uploadSelectedFile,
  uploadState,
  uploads,
} = useUploadWorkspace(props.userId)
</script>

<template>
  <section class="workspace-card">
    <div class="workspace-card__header">
      <div>
        <p class="workspace-card__eyebrow">
          Storage + Reactive URLs
        </p>
        <h2 class="workspace-card__title">
          Upload bench
        </h2>
      </div>

      <p class="workspace-card__count">
        {{ uploads.length }} saved file{{ uploads.length === 1 ? '' : 's' }}
      </p>
    </div>

    <div class="workspace-card__upload-controls">
      <label class="workspace-card__picker">
        <span class="workspace-card__picker-label">Choose a file</span>
        <input class="workspace-card__picker-input" type="file" accept="image/*,.pdf,.txt" @change="selectFile">
      </label>

      <button class="workspace-card__button" type="button" :disabled="!selectedFile || uploadState.isUploading.value" @click="uploadSelectedFile">
        {{ uploadState.isUploading.value ? 'Uploading…' : 'Upload file' }}
      </button>
    </div>

    <div v-if="selectedFile" class="workspace-card__selection">
      <p class="workspace-card__selection-name">
        {{ selectedFile.name }}
      </p>
      <p class="workspace-card__selection-meta">
        {{ formatBytes(selectedFile.size) }} · {{ selectedFile.type || 'Unknown type' }}
      </p>
    </div>

    <div class="workspace-card__status-row">
      <p class="workspace-card__status">
        {{ uploadState.isUploading.value ? `Upload progress ${uploadState.progress.value}%` : 'Uploads flow through @onmax/convex-vue/storage and save metadata through a mutation.' }}
      </p>
    </div>

    <p v-if="error" class="workspace-card__error">
      {{ error.message }}
    </p>
    <p v-else-if="isPending" class="workspace-card__status">
      Syncing the current upload gallery…
    </p>

    <div v-else-if="uploads.length" class="workspace-card__gallery">
      <UploadPreviewCard
        v-for="upload in uploads"
        :key="upload._id"
        :is-deleting="deletingId === upload._id"
        :upload="upload"
        @remove="removeUploadById"
      />
    </div>

    <p v-else class="workspace-card__status">
      No files yet. Upload one to verify the storage entrypoint and reactive preview URL.
    </p>
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

.workspace-card__upload-controls {
  align-items: end;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr) auto;
}

.workspace-card__picker {
  display: grid;
  gap: 0.5rem;
}

.workspace-card__picker-label {
  color: var(--muted-strong);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workspace-card__picker-input {
  background: hsla(0, 0%, 100%, 0.72);
  border: 1px dashed hsla(12, 27%, 62%, 0.6);
  border-radius: 1rem;
  color: var(--ink);
  font: inherit;
  min-height: 3.4rem;
  padding: 0.8rem 1rem;
}

.workspace-card__button {
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
  justify-content: center;
  min-height: 3rem;
  padding: 0 1.25rem;
}

.workspace-card__button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.workspace-card__selection,
.workspace-card__status,
.workspace-card__error {
  background: hsla(43, 36%, 94%, 0.82);
  border: 1px solid var(--line);
  border-radius: 1rem;
  margin: 0;
  padding: 0.95rem 1rem;
}

.workspace-card__selection {
  display: grid;
  gap: 0.25rem;
}

.workspace-card__selection-name,
.workspace-card__selection-meta {
  margin: 0;
}

.workspace-card__selection-meta,
.workspace-card__status {
  color: var(--muted);
}

.workspace-card__error {
  border-color: hsla(6, 68%, 58%, 0.28);
  color: hsl(6, 52%, 38%);
}

.workspace-card__gallery {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

@media (max-width: 720px) {
  .workspace-card__header,
  .workspace-card__upload-controls {
    align-items: stretch;
    grid-template-columns: 1fr;
  }
}
</style>
