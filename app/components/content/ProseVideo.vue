<template>
  <div class="my-6 rounded-lg overflow-hidden shadow-lg">
    <video
      v-if="src"
      :src="refinedSrc"
      :width="width"
      :height="height"
      :controls="controls"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :poster="poster"
      class="w-full h-auto"
      preload="metadata"
    >
      <track
        v-if="caption"
        kind="captions"
        :src="caption"
        :srclang="captionLang || 'pl'"
        :label="captionLabel || 'Polski'"
        default
      >
      Twoja przeglądarka nie obsługuje odtwarzania filmów.
    </video>
    <iframe
      v-else-if="youtubeId"
      :src="`https://www.youtube.com/embed/${youtubeId}`"
      :width="width || '100%'"
      :height="height || '315'"
      frameborder="0"
      allow="
        accelerometer;
        autoplay;
        clipboard-write;
        encrypted-media;
        gyroscope;
        picture-in-picture;
      "
      allowfullscreen
      class="w-full aspect-video rounded-lg"
    />
    <iframe
      v-else-if="vimeoId"
      :src="`https://player.vimeo.com/video/${vimeoId}`"
      :width="width || '100%'"
      :height="height || '315'"
      frameborder="0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
      class="w-full aspect-video rounded-lg"
    />
  </div>
</template>

<script setup lang="ts">
import { withTrailingSlash, withLeadingSlash, joinURL } from 'ufo'
import { useRuntimeConfig, computed } from '#imports'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  width: {
    type: [String, Number],
    default: undefined
  },
  height: {
    type: [String, Number],
    default: undefined
  },
  controls: {
    type: Boolean,
    default: true
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: false
  },
  muted: {
    type: Boolean,
    default: false
  },
  poster: {
    type: String,
    default: undefined
  },
  caption: {
    type: String,
    default: undefined
  },
  captionLang: {
    type: String,
    default: 'pl'
  },
  captionLabel: {
    type: String,
    default: 'Polski'
  },
  youtubeId: {
    type: String,
    default: ''
  },
  vimeoId: {
    type: String,
    default: ''
  }
})

const refinedSrc = computed(() => {
  if (!props.src) return ''
  // Jeśli to już pełny URL (http/https), zwróć bez zmian
  if (props.src.startsWith('http://') || props.src.startsWith('https://')) {
    return props.src
  }
  // Jeśli zaczyna się od /, to ścieżka względna do public
  if (props.src.startsWith('/') && !props.src.startsWith('//')) {
    const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL))
    if (_base !== '/' && !props.src.startsWith(_base)) {
      return joinURL(_base, props.src)
    }
    return props.src
  }
  return props.src
})
</script>

<style scoped>
  /* Removed scoped styles as Tailwind CSS 4 is used for styling */
</style>
