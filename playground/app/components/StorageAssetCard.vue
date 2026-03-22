<script setup lang="ts">
import type { Doc, Id } from '../../convex/_generated/dataModel'

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
</script>

<template>
  <div class="overflow-hidden rounded-md border border-default bg-elevated/50">
    <img v-if="isImage && previewUrl" :src="previewUrl" :alt="upload.name" class="h-40 w-full object-cover">
    <div v-else class="flex h-40 items-center justify-center bg-muted">
      <UIcon name="i-lucide-file" class="size-10 text-dimmed" />
    </div>

    <div class="space-y-2 p-3">
      <div>
        <p class="truncate text-sm font-medium text-highlighted">
          {{ upload.name }}
        </p>
        <p class="text-xs text-dimmed">
          {{ upload.type }} · {{ new Date(upload.createdAt).toLocaleString() }}
        </p>
      </div>

      <div class="flex gap-2">
        <UButton v-if="previewUrl" size="xs" color="neutral" variant="outline" :to="previewUrl" target="_blank">
          Open
        </UButton>
        <UButton size="xs" color="error" variant="ghost" icon="i-lucide-trash-2" :loading="isDeleting" @click="emit('remove', upload._id)">
          Remove
        </UButton>
      </div>
    </div>
  </div>
</template>
