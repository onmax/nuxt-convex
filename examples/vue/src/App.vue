<script setup lang="ts">
const items = [
  'Standalone plugin installation',
  'Vue-native query, mutation, action, and pagination composables',
  'Zero-argument storage and upload helpers',
]
</script>

<template>
  <main class="shell">
    <h1>@onmax/convex-vue</h1>
    <p>A standalone Convex integration for Vue, extracted from the Nuxt module.</p>
    <ul>
      <li v-for="item in items" :key="item">
        {{ item }}
      </li>
    </ul>
  </main>
</template>

<style scoped>
.shell {
  max-width: 720px;
  margin: 4rem auto;
  font-family: 'IBM Plex Sans', sans-serif;
  line-height: 1.5;
  padding: 0 1.5rem;
}
</style>
