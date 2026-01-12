<script lang="ts" setup></script>

<template>
  <div>
    <UHeader
      :ui="{
        container: 'max-w-full blur-none',
        root: [
          'fixed bg-transparent border-none backdrop-blur-none top-0 z-50 transition-all duration-300 w-screen'
        ]
      }"
    >
      <template #title>
        <Logo
          class="w-8 h-8 md:h-16 md:w-16 shrink-0 relative translate-y-3 left-10 -translate-x-1/2"
        />
      </template>

      <template #right>
        <UColorModeSelect />
      </template>
    </UHeader>

    <UMain class="min-h-screen flex items-center justify-center">
      <slot />
    </UMain>
  </div>
</template>
