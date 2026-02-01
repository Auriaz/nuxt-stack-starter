<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

await navigateTo('/dashboard/admin', { redirectCode: 301, replace: true })
</script>

<template>
  <div />
</template>
