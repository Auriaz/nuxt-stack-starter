<script setup>
  const props = defineProps({
    value: {
      required: true,
      type: [Object, Array, String, Number, Boolean],
    },
    index: {
      required: true,
      type: [String, Number],
    },
    expandable: {
      type: Boolean,
      default: false,
    },
  })

  const open = ref(false)
  const type = computed(() => {
    if (Array.isArray(props.value)) return 'array'
    return typeof props.value
  })
</script>

<template>
  <div class="py-0.5">
    <div
      class="flex items-center space-x-2 group"
      :class="{ 'cursor-pointer hover:bg-basic-800/20': expandable }"
      @click="expandable && (open = !open)"
    >
      <Icon
        v-if="expandable"
        name="material-symbols:chevron-right"
        class="text-basic-400 transition-transform"
        :class="[open ? 'rotate-90' : '']"
      />
      <span v-else class="w-4" />
      <span class="text-primary-400">{{ index }}</span>
      <span class="text-primary-400">:</span>
      <span v-if="!expandable" class="pl-2">
        <span v-if="type === 'string'" class="text-success-400">"{{ value }}"</span>
        <span v-else-if="type === 'number'" class="text-error-400">{{ value }}</span>
        <span v-else-if="type === 'boolean'" class="text-info-400">{{
          value ? 'true' : 'false'
        }}</span>
        <span v-else class="text-basic-400">{{ value }}</span>
      </span>
      <span v-else class="text-xs text-basic-500">({{ type }})</span>
    </div>

    <transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div v-if="expandable && open">
        <dump :value="value" :name="`${index}`" :is-nested="true" />
      </div>
    </transition>
  </div>
</template>
