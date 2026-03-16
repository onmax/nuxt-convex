<script setup lang="ts">
const available = [typeof useConvexQuery, typeof useConvexAuth].join(',')
</script>

<template>
  <div>{{ available }}</div>
</template>
