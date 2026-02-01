<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

await navigateTo('/dashboard/admin/users', { redirectCode: 301, replace: true })
</script>

<template>
  <div />
</template>
