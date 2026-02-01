<script lang="ts" setup>
</script>

<template>
  <div class="space-y-6">
    <UCard variant="soft">
      <template #header>
        <h2 class="text-lg font-semibold">
          Połączone konta
        </h2>
        <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Konta OAuth (GitHub, Google) i zarządzanie połączeniami. Lista połączeń i opcja „Odłącz” będą dostępne w kolejnej wersji.
        </p>
      </template>

      <UAlert
        color="primary"
        variant="soft"
        title="Wkrótce"
        description="Zarządzanie połączonymi kontami (OAuth) i kluczami API będzie dostępne w tej sekcji."
        icon="i-heroicons-puzzle-piece"
        class="rounded-lg"
      />
    </UCard>
  </div>
</template>
