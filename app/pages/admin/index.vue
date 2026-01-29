<script setup lang="ts">
import { PERMISSIONS } from '#shared/permissions'

definePageMeta({
  middleware: 'auth',
  permission: PERMISSIONS.ADMIN_ACCESS
})
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">
        Panel administracyjny
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Zarządzaj użytkownikami, rolami i uprawnieniami.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <UCard>
        <div class="space-y-4">
          <div>
            <h2 class="text-lg font-semibold">
              Użytkownicy
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Zmieniaj role i kontroluj dostęp.
            </p>
          </div>
          <UButton
            to="/admin/users"
            color="primary"
            variant="soft"
          >
            Przejdź do użytkowników
          </UButton>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-4">
          <div>
            <h2 class="text-lg font-semibold">
              Role i uprawnienia
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Zarządzaj rolami i przypisuj permissions.
            </p>
          </div>
          <UButton
            to="/admin/roles"
            color="primary"
            variant="soft"
          >
            Przejdź do ról
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
