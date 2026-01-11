<script setup>
  const props = defineProps({
    value: { type: [Object, Array, String, Number, Boolean], required: true },
    name: { type: String, default: 'var' },
    isNested: { type: Boolean, default: false },
    isHeader: { type: Boolean, default: true },
    title: { type: String, default: 'Debug Data' },
    icon: { type: String, default: 'material-symbols:data-object' },
    borderColor: { type: String, default: 'default' },
  })

  const open = ref(true)
  const type = computed(() => {
    if (Array.isArray(props.value)) return 'array'
    return typeof props.value
  })

  const isExpandable = computed(() => {
    return type.value === 'object' || type.value === 'array'
  })

  const classBorderColor = computed(() => {
    return {
      success: 'border-success-800/50 dark:border-success-700/50',
      warning: 'border-warning-800/50 dark:border-warning-700/50',
      info: 'border-info-800/50 dark:border-info-700/50',
      danger: 'border-danger-800/50 dark:border-danger-700/50',
      error: 'border-error-800/50 dark:border-error-700/50',
      primary: 'border-primary-800/50 dark:border-primary-700/50',
      default: 'border-black',
    }[props.borderColor]
  })
</script>

<template>
  <div
    v-if="value"
    :class="[
      'w-full ',
      isNested
        ? 'my-0'
        : 'rounded-lg overflow-hidden border bg-basic-900/95 dark:bg-basic-950/95 backdrop-blur-sm shadow-lg shadow-black',
      open ? 'pb-1' : '',
      classBorderColor,
    ]"
  >
    <!-- Header - tylko dla głównego dumpa -->
    <div
      v-if="!isNested && isHeader"
      class="w-full flex justify-between items-center px-4 py-3 bg-basic-950/50 dark:bg-basic-900/50 border-b border-basic-800/50 dark:border-basic-700/50"
      :class="[open ? 'mb-4' : '']"
    >
      <div class="flex items-center space-x-2 text-basic-200">
        <Icon v-if="icon != ''" :name="icon" class="text-2xl text-primary-400" />
        <span v-if="title != ''" class="font-mono font-medium">{{ title }}</span>
        <span v-if="type != ''" class="text-sm text-basic-500">({{ type }})</span>
      </div>

      <button
        v-if="isExpandable"
        class="p-1.5 rounded-lg hover:bg-basic-800/50 transition-colors duration-200"
        type="button"
        @click="open = !open"
      >
        <Icon
          name="material-symbols:keyboard-arrow-down-rounded"
          class="text-2xl text-basic-400 transition-transform duration-200"
          :class="[open ? 'rotate-180' : '']"
        />
      </button>
    </div>

    <div v-if="!isNested && !isHeader" class="flex w-full flex">
      <button
        v-if="isExpandable"
        class="p-1.5 flex items-center rounded-lg hover:bg-basic-800/50 transition-colors duration-200"
        type="button"
        @click="open = !open"
      >
        <Icon
          name="material-symbols:keyboard-arrow-down-rounded"
          class="text-2xl text-basic-400 transition-transform duration-200"
          :class="[open ? 'rotate-0' : '-rotate-90']"
        />
      </button>

      <div class="flex items-center space-x-2 text-basic-200">
        <span v-if="title != ''" class="font-mono font-medium">{{ title }}</span>
        <span v-if="type != ''" class="text-sm text-basic-500">({{ type }})</span>
      </div>
    </div>

    <!-- Content -->
    <div v-if="!isExpandable" class="py-4 font-mono">
      <span v-if="type === 'string'" class="text-success-400">"{{ value }}"</span>
      <span v-else-if="type === 'number'" class="text-error-400">{{ value }}</span>
      <span v-else-if="type === 'boolean'" class="text-info-400">{{
        value ? 'true' : 'false'
      }}</span>
      <span v-else class="text-basic-400">{{ value }}</span>
    </div>

    <div
      v-else-if="open"
      class="text-sm font-mono"
      :class="[isNested ? 'overflow-visible' : 'overflow-x-auto max-h-[80vh]']"
    >
      <div class="space-y-1">
        <div class="pl-6">
          <template v-if="type === 'array'">
            <div v-for="(item, index) in value" :key="index">
              <dump-item
                :value="item"
                :index="index"
                :expandable="typeof item === 'object' || Array.isArray(item)"
              />
            </div>
          </template>
          <template v-else>
            <div v-for="(item, key) in value" :key="key">
              <dump-item
                :value="item"
                :index="key"
                :expandable="typeof item === 'object' || Array.isArray(item)"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
