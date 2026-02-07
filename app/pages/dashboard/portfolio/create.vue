<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Dodaj projekt - Portfolio - Dashboard',
  description: 'Tworzenie nowego projektu portfolio'
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Dodaj projekt portfolio"
      icon="i-lucide-plus"
    >
      <template #body>
        <UAlert
          color="primary"
          variant="soft"
          title="Strona w przygotowaniu"
          description="Formularz dodawania projektu będzie dostępny w kolejnej wersji."
          icon="i-lucide-construction"
        />
        <UButton
          to="/dashboard/portfolio"
          variant="soft"
          color="primary"
          class="mt-4"
        >
          Wróć do portfolio
        </UButton>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
