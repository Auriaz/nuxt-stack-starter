<script lang="ts" setup>
</script>

<template>
  <div class="space-y-6">
    <UCard variant="soft">
      <template #header>
        <h2 class="text-lg font-semibold">
          Bezpieczeństwo
        </h2>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Zarządzanie hasłem, uwierzytelnianiem dwuetapowym (2FA) i sesjami — w jednym miejscu w profilu.
        </p>
      </template>

      <div class="space-y-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
          <div>
            <p class="font-medium">
              Hasło
            </p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              Zmień hasło do konta
            </p>
          </div>
          <UButton
            to="/dashboard/profile?tab=security"
            variant="outline"
            color="neutral"
            trailing-icon="i-heroicons-arrow-right"
          >
            Przejdź do profilu
          </UButton>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
          <div>
            <p class="font-medium">
              Uwierzytelnianie dwuetapowe (2FA)
            </p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              Włącz lub wyłącz 2FA
            </p>
          </div>
          <UButton
            to="/dashboard/profile?tab=security"
            variant="outline"
            color="neutral"
            trailing-icon="i-heroicons-arrow-right"
          >
            Przejdź do profilu
          </UButton>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
          <div>
            <p class="font-medium">
              Sesje
            </p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              Aktywne sesje i wylogowanie na innych urządzeniach
            </p>
          </div>
          <UButton
            to="/dashboard/profile?tab=activity"
            variant="outline"
            color="neutral"
            trailing-icon="i-heroicons-arrow-right"
          >
            Przejdź do profilu
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
