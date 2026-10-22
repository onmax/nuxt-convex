<script setup lang="ts">
// Adapted from Inspira UI's BorderBeam (https://inspira-ui.com/docs/components/special-effects/border-beam,
// MIT), itself a port of Magic UI. Changes: no `cn` dependency, durations in seconds, and the beam is
// hidden under prefers-reduced-motion.
const props = withDefaults(defineProps<{
  size?: number
  duration?: number
  borderWidth?: number
  anchor?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
}>(), {
  size: 220,
  duration: 12,
  anchor: 90,
  borderWidth: 1,
  colorFrom: 'var(--color-brand-amber)',
  colorTo: 'var(--color-brand-red)',
  delay: 0,
})

const style = computed(() => ({
  '--beam-size': props.size,
  '--beam-duration': `${props.duration}s`,
  '--beam-anchor': props.anchor,
  '--beam-border-width': props.borderWidth,
  '--beam-color-from': props.colorFrom,
  '--beam-color-to': props.colorTo,
  '--beam-delay': `-${props.delay}s`,
}))
</script>

<template>
  <div
    aria-hidden="true"
    class="border-beam pointer-events-none absolute inset-0 rounded-[inherit]"
    :style="style"
  />
</template>

<style scoped>
.border-beam {
  border: calc(var(--beam-border-width) * 1px) solid transparent;
  mask:
    linear-gradient(transparent, transparent) padding-box,
    linear-gradient(white, white) border-box;
  mask-composite: intersect;
}

.border-beam::after {
  content: '';
  position: absolute;
  aspect-ratio: 1;
  width: calc(var(--beam-size) * 1px);
  background: linear-gradient(to left, var(--beam-color-from), var(--beam-color-to), transparent);
  offset-anchor: calc(var(--beam-anchor) * 1%) 50%;
  offset-path: rect(0 auto auto 0 round calc(var(--beam-size) * 1px));
  animation: border-beam var(--beam-duration) linear infinite;
  animation-delay: var(--beam-delay);
}

@keyframes border-beam {
  to {
    offset-distance: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .border-beam::after {
    display: none;
  }
}
</style>
