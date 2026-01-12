<script setup lang="ts">
defineOptions({
  inheritAttrs: false
})

defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-between bg-slate-900 p-16 relative overflow-hidden"
  >
    <!-- Dekoracyjne elementy tła -->
    <div
      class="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full"
      style="transform: translate(192px, -192px)"
    />
    <div
      class="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full"
      style="transform: translate(-192px, 192px)"
    />

    <!-- Główna zawartość -->
    <div class="relative flex-1 flex flex-col justify-center">
      <!-- Badge/Brand -->
      <div class="mb-8 flex items-center justify-center">
        <div class="px-6 py-2 bg-white/20 rounded-full border border-white/30">
          <span class="text-white text-xl font-semibold tracking-wide">BLOG</span>
        </div>
      </div>

      <!-- Tytuł -->
      <h1 class="text-7xl font-bold text-white mb-6 leading-tight max-w-5xl mx-auto">
        {{ title }}
      </h1>

      <!-- Opis -->
      <p class="text-3xl text-gray-300 leading-relaxed max-w-4xl mx-auto font-light">
        {{ description }}
      </p>
    </div>

    <!-- Footer z dekoracyjną linią -->
    <div class="relative z-10 flex items-center gap-4">
      <div class="flex-1 h-px bg-white/30" />
      <div class="w-2 h-2 rounded-full bg-white/50" />
      <div class="flex-1 h-px bg-white/30" />
    </div>
  </div>
</template>
