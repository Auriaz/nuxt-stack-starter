<script lang="ts" setup></script>

<template>
  <div class="relative w-screen">
    <!-- Global Canvas Backgrounds - Fixed to viewport -->
    <!-- Network Canvas Background in Dark Mode -->
    <div class="fixed inset-0 -z-10 pointer-events-none">
      <!-- @ts-expect-error - Vue ref type compatibility

        <CanvasBackground :container="null" />
      -->
    </div>

    <!-- Cockpit Grid Background - Enhanced -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-cockpit-grid opacity-30" />
      <div class="absolute inset-0 bg-grid-pattern opacity-40" />
    </div>

    <slot />
  </div>
</template>
