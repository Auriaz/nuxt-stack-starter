<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Portfolio - Dashboard',
  description: 'Zarządzanie projektami portfolio'
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Portfolio"
      icon="i-lucide-folder-kanban"
    >
      <template #body>
        <UAlert
          color="primary"
          variant="soft"
          title="Strona w przygotowaniu"
          description="Zarządzanie projektami portfolio będzie dostępne w kolejnej wersji."
          icon="i-lucide-construction"
        />
        <UButton
          to="/dashboard"
          variant="soft"
          color="primary"
          class="mt-4"
        >
          Wróć do dashboardu
        </UButton>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
