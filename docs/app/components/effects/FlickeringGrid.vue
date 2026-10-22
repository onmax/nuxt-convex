<script setup lang="ts">
// Adapted from Inspira UI's FlickeringGrid (https://inspira-ui.com/docs/components/backgrounds/flickering-grid,
// MIT), itself a port of Magic UI. Changes: the color comes from the element's CSS `color` so it follows
// the theme, redraws are capped at ~12 fps, and prefers-reduced-motion draws one static frame.
const props = withDefaults(defineProps<{
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  maxOpacity?: number
  fps?: number
}>(), {
  squareSize: 4,
  gridGap: 6,
  flickerChance: 0.3,
  maxOpacity: 0.3,
  fps: 12,
})

const container = useTemplateRef<HTMLDivElement>('container')
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

let frame: number | undefined
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined

onMounted(() => {
  const el = container.value
  const cvs = canvas.value
  const ctx = cvs?.getContext('2d')
  if (!el || !cvs || !ctx)
    return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const step = props.squareSize + props.gridGap
  let cols = 0
  let rows = 0
  let dpr = 1
  let squares = new Float32Array(0)
  let inView = false
  let last = 0

  function setup() {
    const { width, height } = el!.getBoundingClientRect()
    dpr = window.devicePixelRatio || 1
    cvs!.width = Math.round(width * dpr)
    cvs!.height = Math.round(height * dpr)
    cvs!.style.width = `${width}px`
    cvs!.style.height = `${height}px`
    cols = Math.floor(width / step)
    rows = Math.floor(height / step)
    squares = new Float32Array(cols * rows)
    for (let i = 0; i < squares.length; i++)
      squares[i] = Math.random() * props.maxOpacity
    draw()
  }

  function draw() {
    ctx!.clearRect(0, 0, cvs!.width, cvs!.height)
    ctx!.fillStyle = getComputedStyle(el!).color
    const size = props.squareSize * dpr
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        ctx!.globalAlpha = squares[i * rows + j]!
        ctx!.fillRect(i * step * dpr, j * step * dpr, size, size)
      }
    }
    ctx!.globalAlpha = 1
  }

  function tick(time: number) {
    if (!inView || reducedMotion.matches)
      return
    const elapsed = time - last
    if (elapsed >= 1000 / props.fps) {
      const delta = elapsed / 1000
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < props.flickerChance * delta)
          squares[i] = Math.random() * props.maxOpacity
      }
      draw()
      last = time
    }
    frame = requestAnimationFrame(tick)
  }

  setup()

  resizeObserver = new ResizeObserver(setup)
  resizeObserver.observe(el)

  intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = !!entry?.isIntersecting
    if (frame)
      cancelAnimationFrame(frame)
    if (inView)
      frame = requestAnimationFrame(tick)
  })
  intersectionObserver.observe(cvs)
})

onBeforeUnmount(() => {
  if (frame)
    cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
})
</script>

<template>
  <div
    ref="container"
    aria-hidden="true"
    class="size-full"
  >
    <canvas
      ref="canvas"
      class="pointer-events-none block"
    />
  </div>
</template>
