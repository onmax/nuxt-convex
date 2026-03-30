<script setup lang="ts">
import type { UploadDoc, UploadId } from '../lib/model'
import { computed } from 'vue'
import { useConvexStorage } from 'vue-convex/storage'
import { formatRelativeTime } from '../lib/format'

const props = defineProps<{
  isDeleting: boolean
  upload: UploadDoc
}>()

const emit = defineEmits<{
  remove: [id: UploadId]
}>()

const { getUrl } = useConvexStorage()
const reactiveUrl = getUrl(props.upload.storageId)
const previewUrl = computed(() => reactiveUrl.value ?? props.upload.url ?? null)
const isImage = computed(() => props.upload.type.startsWith('image/') && Boolean(previewUrl.value))

function handleRemove() {
  emit('remove', props.upload._id)
}
</script>

<template>
  <article class="upload-card">
    <div class="upload-card__media">
      <img v-if="isImage" class="upload-card__image" :src="previewUrl!" :alt="upload.name">
      <div v-else class="upload-card__fallback">
        {{ upload.name.slice(0, 2).toUpperCase() }}
      </div>
    </div>

    <div class="upload-card__body">
      <div class="upload-card__copy">
        <p class="upload-card__name">
          {{ upload.name }}
        </p>
        <p class="upload-card__meta">
          {{ upload.type || 'Stored file' }} · {{ formatRelativeTime(upload.createdAt) }}
        </p>
      </div>

      <div class="upload-card__actions">
        <a v-if="previewUrl" class="upload-card__link" :href="previewUrl" target="_blank" rel="noreferrer">
          Open
        </a>
        <button class="upload-card__button" type="button" :disabled="isDeleting" @click="handleRemove">
          {{ isDeleting ? 'Removing…' : 'Remove' }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.upload-card {
  background: hsla(0, 0%, 100%, 0.76);
  border: 1px solid var(--line);
  border-radius: 1.25rem;
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: 0.95rem;
  overflow: hidden;
}

.upload-card__media {
  background:
    radial-gradient(circle at top left, hsla(14, 85%, 68%, 0.24), transparent 52%),
    linear-gradient(135deg, hsla(40, 40%, 92%, 0.92), hsla(0, 0%, 100%, 0.84));
  min-height: 10rem;
}

.upload-card__image,
.upload-card__fallback {
  display: block;
  height: 100%;
  width: 100%;
}

.upload-card__image {
  object-fit: cover;
}

.upload-card__fallback {
  align-items: center;
  color: var(--accent-strong);
  display: flex;
  font-family: var(--display-font);
  font-size: 2rem;
  justify-content: center;
}

.upload-card__body {
  display: grid;
  gap: 0.9rem;
  padding: 0 1rem 1rem;
}

.upload-card__copy {
  display: grid;
  gap: 0.35rem;
}

.upload-card__name,
.upload-card__meta {
  margin: 0;
}

.upload-card__name {
  font-weight: 600;
}

.upload-card__meta {
  color: var(--muted);
  font-size: 0.9rem;
}

.upload-card__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
}

.upload-card__link,
.upload-card__button {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font: inherit;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0 0.95rem;
  text-decoration: none;
}

.upload-card__link {
  background: hsla(0, 0%, 100%, 0.94);
  border: 1px solid var(--line);
  color: var(--ink);
}

.upload-card__button {
  background: transparent;
  border: 1px solid hsla(12, 27%, 62%, 0.4);
  color: var(--muted-strong);
  cursor: pointer;
}

.upload-card__button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
