<template>
  <div
    class="bg-yellow-100 border border-yellow-300 p-4 rounded-lg text-yellow-800 text-sm leading-relaxed shadow-md"
  >
    Rendering the <code>script</code> element is dangerous and is disabled by default. Consider
    implementing your own <code>ProseScript</code> element to have control over script rendering.
  </div>
</template>

<script setup lang="ts">
defineProps({
  src: {
    type: String,
    default: ''
  }
})
// const isDev = import.meta.dev
</script>

<style scoped>
  /* Removed scoped styles as Tailwind CSS 4 is used for styling */
</style>
