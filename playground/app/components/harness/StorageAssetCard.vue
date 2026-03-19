<script setup lang="ts">
import type { Doc, Id } from '../../../convex/_generated/dataModel'

const props = withDefaults(defineProps<{
  upload: Doc<'uploads'>
  isDeleting?: boolean
}>(), {
  isDeleting: false,
})

const emit = defineEmits<{
  remove: [id: Id<'uploads'>]
}>()

const { getUrl } = useConvexStorage()
const reactiveUrl = getUrl(props.upload.storageId)
const previewUrl = computed(() => reactiveUrl.value || props.upload.url || null)
const isImage = computed(() => props.upload.type.startsWith('image/'))

function removeUpload(): void {
  emit('remove', props.upload._id)
}
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-default/60 bg-default/70">
    <div class="relative">
      <img
        v-if="isImage && previewUrl"
        :src="previewUrl"
        :alt="upload.name"
        class="h-48 w-full object-cover"
      >
      <div v-else class="flex h-48 items-center justify-center bg-muted">
        <UIcon name="i-heroicons-document" class="size-10 text-dimmed" />
      </div>
    </div>

    <div class="space-y-3 p-4">
      <div class="space-y-1">
        <p class="truncate font-medium text-highlighted">
          {{ upload.name }}
        </p>
        <p class="text-xs text-dimmed">
          {{ upload.type }} · {{ new Date(upload.createdAt).toLocaleString() }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UBadge color="neutral" variant="subtle">
          Reactive URL {{ previewUrl ? 'ready' : 'pending' }}
        </UBadge>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton
          v-if="previewUrl"
          size="sm"
          color="neutral"
          variant="outline"
          :to="previewUrl"
          target="_blank"
        >
          Open asset
        </UButton>
        <UButton
          size="sm"
          color="error"
          variant="ghost"
          icon="i-heroicons-trash"
          :loading="isDeleting"
          @click="removeUpload"
        >
          Remove
        </UButton>
      </div>
    </div>
  </div>
</template>
