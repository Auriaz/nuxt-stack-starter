<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Biblioteka mediów - Dashboard',
  description: 'Zarządzanie zdjęciami i filmami'
})
</script>

<template>
  <NuxtLayout>
    <DashboardPanel
      title="Biblioteka mediów"
      icon="i-lucide-image"
    >
      <template #body>
        <MediaLibrary />
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
