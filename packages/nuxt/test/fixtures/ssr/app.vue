<script setup lang="ts">
import { isConvexError } from '#convex'
import { api } from '#convex/api'

const [tasks, whoami] = await Promise.all([
  useConvexQuery(api.tasks.list, {}),
  useConvexQuery(api.tasks.whoami, {}),
])
</script>

<template>
  <main>
    <p id="awaited">
      {{ tasks.data.value?.map((task: { text: string }) => task.text).join(',') }}
    </p>
    <p id="whoami">
      {{ whoami.data.value }}
    </p>
    <ConvexQuery :query="api.tasks.forbidden" :args="{}">
      <template #default>
        <p id="forbidden">
          unexpected
        </p>
      </template>
      <template #error="{ error }">
        <p id="forbidden">
          {{ isConvexError(error, 'FORBIDDEN') ? 'forbidden' : error.message }}
        </p>
      </template>
    </ConvexQuery>
    <ConvexPaginatedQuery :query="api.tasks.paginated" :args="{}" :options="{ numItems: 5 }">
      <template #default="{ data }">
        <p id="paginated">
          {{ data.map((item: { text: string }) => item.text).join(',') }}
        </p>
      </template>
    </ConvexPaginatedQuery>
    <ConvexAuthenticated>
      <p id="signed-in">
        signed-in
      </p>
    </ConvexAuthenticated>
    <ConvexUnauthenticated>
      <p id="signed-out">
        signed-out
      </p>
    </ConvexUnauthenticated>
  </main>
</template>
