<script lang="ts" setup>
definePageMeta({
  middleware: 'auth'
})

useSeoMeta({
  title: '2FA - Profil',
  description: 'TODO: Strona konfiguracji 2FA'
})
</script>

<template>
  <NuxtLayout name="default">
    <div class="mx-auto w-full max-w-3xl px-4 py-10">
      <UAlert
        color="neutral"
        variant="soft"
        title="2FA (TODO)"
        description="Ten ekran zostanie uzupełniony później."
        icon="i-lucide-shield"
      />
    </div>
  </NuxtLayout>
</template>
