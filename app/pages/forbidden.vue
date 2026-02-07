<script lang="ts" setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const permission = computed(() => String(route.query.permission || ''))
</script>

<template>
  <section class="mx-auto max-w-3xl px-6 py-16">
    <UAlert
      color="error"
      variant="soft"
      title="Brak uprawnien"
      :description="permission ? `Brakuje wymaganego uprawnienia: ${permission}` : 'Nie masz wymaganych uprawnien do tej strony.'"
    />
    <div class="mt-6 flex flex-wrap gap-3">
      <UButton
        color="primary"
        to="/dashboard"
      >
        Wroc do dashboardu
      </UButton>
    </div>
  </section>
</template>
