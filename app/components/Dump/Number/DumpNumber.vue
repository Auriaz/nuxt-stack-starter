<script setup>
defineProps({
  value: {
    type: String,
    required: true
  },
  index: {
    type: String,
    required: true
  }
})

const open = ref(true)
</script>

<template>
  <div class="flex items-center py-0.5 group">
    <span
      class="flex items-center space-x-2 text-primary-400 cursor-pointer"
      @click="open = !open"
    >
      <span>{{ index }}</span>
      <span>:</span>
    </span>

    <transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 translate-x-2"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-2"
    >
      <span
        v-if="open"
        class="pl-2 text-error-400"
      >{{ value }}</span>
    </transition>
  </div>
</template>
