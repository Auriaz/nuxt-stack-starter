<script setup lang="ts">
import type { SectionMap, SectionBase } from '#shared/types/sections'

interface Props {
  section: SectionMap
  base: SectionBase
  props: SectionMap['props']
}

const props = defineProps<Props>()

const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  type: props.props?.type || 'embed',
  embedUrl: props.props?.embedUrl,
  linkUrl: props.props?.linkUrl,
  addressText: props.props?.addressText,
  note: props.props?.note,
  align: props.base.align || 'center'
}))

const headerClasses = computed(() => ({
  'text-center': config.value.align === 'center',
  'text-left': config.value.align === 'left'
}))
</script>

<template>
  <div>
    <div
      v-if="config.title || config.description"
      :class="['mb-8', headerClasses]"
    >
      <h2
        v-if="config.title"
        class="text-3xl md:text-4xl font-bold mb-4"
      >
        {{ config.title }}
      </h2>
      <p
        v-if="config.description"
        class="text-lg text-muted max-w-2xl"
        :class="config.align === 'center' ? 'mx-auto' : ''"
      >
        {{ config.description }}
      </p>
    </div>

    <!-- Embed Variant -->
    <div
      v-if="config.type === 'embed' && config.embedUrl"
      class="relative aspect-video rounded-lg overflow-hidden bg-muted"
    >
      <iframe
        :src="config.embedUrl"
        class="w-full h-full border-0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Mapa lokalizacji"
      />
    </div>

    <!-- Link Variant -->
    <div
      v-else-if="config.type === 'link'"
      class="space-y-4"
    >
      <div
        v-if="config.addressText"
        class="p-6 rounded-lg bg-muted/50"
      >
        <p class="text-lg whitespace-pre-line">
          {{ config.addressText }}
        </p>
      </div>

      <UButton
        v-if="config.linkUrl"
        :to="config.linkUrl"
        target="_blank"
        rel="noopener noreferrer"
        color="primary"
        variant="outline"
        size="lg"
        icon="i-lucide-map-pin"
      >
        Otwórz w mapach
      </UButton>

      <p
        v-if="config.note"
        class="text-sm text-muted"
      >
        {{ config.note }}
      </p>
    </div>
  </div>
</template>
