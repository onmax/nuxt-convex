<script setup lang="ts">
const colorMode = useColorMode()
colorMode.preference = 'dark'
</script>

<template>
  <UApp>
    <NuxtPage />
    <UNotifications />
  </UApp>
</template>
