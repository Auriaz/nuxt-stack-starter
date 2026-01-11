<script setup>
  defineProps({
    value: {
      type: String,
      required: true,
    },
    index: {
      type: String,
      required: true,
    },
  })

  const open = ref(true)
</script>

<template>
  <div class="flex items-center py-0.5 group">
    <div class="flex items-center space-x-2 cursor-pointer" @click="open = !open">
      <Icon
        name="material-symbols:chevron-right"
        class="text-basic-400 transition-transform"
        :class="[open ? 'rotate-90' : '']"
      />
      <span class="text-primary-400">{{ index }}</span>
      <span class="text-primary-400">:</span>
    </div>

    <transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 translate-x-2"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 translate-x-2"
    >
      <span v-if="open" class="pl-2 text-success-400">"{{ value }}"</span>
    </transition>
  </div>
</template>
