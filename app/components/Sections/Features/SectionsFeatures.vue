<script setup lang="ts">
import type { SectionFeatures } from '#shared/types/sections'
import PageSection from '~/components/Page/Section/PageSection.vue'

defineProps<{
  section: SectionFeatures
}>()
</script>

<template>
  <PageSection
    :headline="section.headline"
    :icon="section.icon"
    :title="section.title"
    :description="section.description"
    :features="section.features"
    :reverse="section.reverse"
    :ui="section.ui"
    :type="section.type"
  />
</template>
