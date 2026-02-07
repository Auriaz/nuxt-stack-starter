<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Usługi - Dashboard',
  description: 'Zarządzanie usługami'
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Usługi"
      icon="i-lucide-briefcase"
    >
      <template #body>
        <UAlert
          color="primary"
          variant="soft"
          title="Strona w przygotowaniu"
          description="Zarządzanie usługami będzie dostępne w kolejnej wersji."
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
