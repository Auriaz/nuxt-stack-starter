<script lang="ts" setup>
defineProps<{
  title: string
  items: Array<{
    label: string
    value: string
    icon?: string
    to?: string
  }>
}>()

const colorMode = useColorMode()
</script>

<template>
  <UPageCard
    variant="ghost"
    class="glass-panel cockpit-panel relative overflow-hidden"
  >
    <!-- HUD Corner Indicators -->
    <div class="cockpit-hud-corners" />

    <div class="p-6">
      <h3
        class="text-lg font-semibold mb-4"
        :class="{
          'text-slate-800': colorMode.preference === 'light',
          'text-white': colorMode.preference === 'dark' || colorMode.preference === 'system'
        }"
      >
        {{ title }}
      </h3>

      <div class="space-y-3">
        <UButton
          v-for="(item, index) in items"
          :key="index"
          :to="item.to"
          variant="ghost"
          color="neutral"
          block
          class="justify-start"
        >
          <template
            v-if="item.icon"
            #leading
          >
            <UIcon
              :name="item.icon"
              class="w-4 h-4"
            />
          </template>
          <div class="flex-1 text-left">
            <div
              class="text-sm font-medium"
              :class="{
                'text-slate-700': colorMode.preference === 'light',
                'text-slate-200': colorMode.preference === 'dark' || colorMode.preference === 'system'
              }"
            >
              {{ item.label }}
            </div>
            <div
              class="text-xs"
              :class="{
                'text-slate-500': colorMode.preference === 'light',
                'text-slate-400': colorMode.preference === 'dark' || colorMode.preference === 'system'
              }"
            >
              {{ item.value }}
            </div>
          </div>
        </UButton>
      </div>
    </div>
  </UPageCard>
</template>
