<script lang="ts" setup>
import type { DefineComponent } from 'vue'
import { LazyMotion, domAnimation, motion } from 'motion-v'
import type { MediaAssetDTO } from '#shared/types'
import { getMotionPreset, motionPresets } from '~/utils/motion'
import { usePreferredReducedMotion } from '@vueuse/core'

defineProps<{
  items: MediaAssetDTO[]
  loading?: boolean
  slideover?: boolean
}>()

const emit = defineEmits<{
  select: [asset: MediaAssetDTO]
}>()

const LazyMotionWrapper = LazyMotion as unknown as DefineComponent<Record<string, unknown>>
const MotionItem = motion.div as unknown as DefineComponent<Record<string, unknown>>
const prefersReducedMotion = usePreferredReducedMotion()
const reduceMotion = computed(() => prefersReducedMotion.value === 'reduce')
const cardMotion = computed(() => getMotionPreset(motionPresets.mediaCardEnter, reduceMotion.value))

function onSelect(asset: MediaAssetDTO) {
  emit('select', asset)
}

function staggerDelay(index: number) {
  return { delay: index * 0.04, duration: 0.35, ease: 'easeOut' as const }
}
</script>

<template>
  <div
    v-if="loading"
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
  >
    <div
      v-for="i in 10"
      :key="i"
      class="aspect-square rounded-lg bg-basic-200 dark:bg-basic-700 animate-pulse"
    />
  </div>
  <LazyMotionWrapper
    v-else-if="items.length > 0"
    :features="domAnimation"
  >
    <div
      class="grid gap-4"
      :class="[slideover ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5']"
    >
      <MotionItem
        v-for="(asset, index) in items"
        :key="asset.id"
        v-bind="cardMotion"
        :transition="staggerDelay(index)"
        class="grid place-items-stretch"
      >
        <MediaCard
          :asset="asset"
          @click="onSelect"
        />
      </MotionItem>
    </div>
  </LazyMotionWrapper>
  <div
    v-else
    class="text-center py-12 text-basic-500 dark:text-basic-400"
  >
    <UIcon
      name="i-lucide-folder-open"
      class="w-12 h-12 mx-auto mb-2 opacity-50"
    />
    <p>Brak plików. Prześlij pierwszy plik powyżej.</p>
  </div>
</template>
