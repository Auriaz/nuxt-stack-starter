<script lang="ts" setup>
import type { TestimonialItem } from '#shared/types/common'

const props = defineProps({
  testimonial: {
    type: Object as PropType<TestimonialItem>,
    required: true
  },
  itemClass: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <UCard
    :ui="{
      root: props.testimonial.ui?.card?.root || 'relative h-full ring-1 ring-gray-200 dark:ring-gray-800',
      body: props.testimonial.ui?.card?.body || 'p-6 sm:p-8'
    }"
    :class="[
      itemClass,
      props.testimonial.featured && 'ring-2 ring-primary'
    ]"
  >
    <!-- Rating -->
    <div
      v-if="props.testimonial.rating"
      class="mb-4 flex items-center gap-1"
      :class="props.testimonial.ui?.rating?.root"
    >
      <UIcon
        v-for="star in 5"
        :key="star"
        name="i-lucide-star"
        :class="[
          props.testimonial.ui?.rating?.icon || 'h-5 w-5',
          star <= props.testimonial.rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300 dark:text-gray-700'
        ]"
      />
    </div>

    <!-- Quote -->
    <blockquote class="mb-6 text-base text-gray-700 dark:text-gray-300">
      <p class="before:content-['\201C'] after:content-['\201D']">
        {{ props.testimonial.quote }}
      </p>
    </blockquote>

    <!-- Author -->
    <div
      class="flex items-center gap-4"
      :class="props.testimonial.ui?.author?.root"
    >
      <UAvatar
        v-if="props.testimonial.author?.avatar"
        :src="props.testimonial.author.avatar"
        :alt="props.testimonial.author.name"
        size="lg"
        :class="props.testimonial.ui?.author?.avatar"
      />
      <UAvatar
        v-else
        :alt="props.testimonial.author.name"
        size="lg"
        :class="props.testimonial.ui?.author?.avatar"
      />
      <div class="flex-1">
        <p
          class="font-semibold text-gray-900 dark:text-white"
          :class="props.testimonial.ui?.author?.name"
        >
          {{ props.testimonial.author.name }}
        </p>
        <p
          v-if="props.testimonial.author.role"
          class="text-sm text-gray-600 dark:text-gray-400"
          :class="props.testimonial.ui?.author?.role"
        >
          {{ props.testimonial.author.role }}
        </p>
        <p
          v-if="props.testimonial.author.company"
          class="text-sm text-gray-500 dark:text-gray-500"
          :class="props.testimonial.ui?.author?.company"
        >
          {{ props.testimonial.author.company }}
        </p>
      </div>
    </div>

    <!-- Featured Badge -->
    <UBadge
      v-if="props.testimonial.featured"
      color="primary"
      variant="solid"
      class="absolute right-4 top-4"
    >
      Wyróżnione
    </UBadge>
  </UCard>
</template>
