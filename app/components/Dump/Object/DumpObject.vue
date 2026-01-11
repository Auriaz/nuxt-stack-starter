<script setup>
  defineProps({
    value: { type: String, required: true },
    index: { type: String, required: true },
  })

  const open = ref(true)
</script>

<template>
  <div class="py-0.5">
    <div class="flex items-center space-x-2 cursor-pointer group" @click="open = !open">
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
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="open" class="pl-4 mt-1">
        <div class="flex items-center space-x-2">
          <span v-if="Array.isArray(value)" class="text-error-400">[</span>
          <span v-else-if="typeof value === 'object'" class="text-warning-400">{</span>
        </div>

        <div class="pl-4">
          <div v-for="(item, idx) in value" :key="idx">
            <dump-string v-if="typeof item === 'string'" :value="item" :index="idx" />
            <dump-boolean v-if="typeof item === 'boolean'" :value="item" :index="idx" />
            <dump-number v-if="typeof item === 'number'" :value="item" :index="idx" />
            <dump-object v-if="typeof item === 'object'" :value="item" :index="idx" />
          </div>
        </div>

        <div class="flex items-center">
          <span v-if="Array.isArray(value)" class="text-error-400">]</span>
          <span v-else-if="typeof value === 'object'" class="text-warning-400">}</span>
        </div>
      </div>
    </transition>
  </div>
</template>
