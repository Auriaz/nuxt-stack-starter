<script setup lang="ts">
interface Testimonial {
  name: string
  role: string
  company?: string
  content: string
  avatar?: string
}

interface Props {
  title?: string
  testimonials?: Testimonial[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Co mówią o nas',
  testimonials: () => [
    {
      name: 'Jan Kowalski',
      role: 'CEO',
      company: 'Firma XYZ',
      content:
          'Nuxt Base Starter pozwolił nam szybko rozpocząć projekt. Wszystko działa out-of-the-box.',
      avatar: undefined
    },
    {
      name: 'Anna Nowak',
      role: 'Lead Developer',
      company: 'Tech Solutions',
      content: 'Świetna dokumentacja i struktura. Idealne rozwiązanie dla naszego zespołu.',
      avatar: undefined
    },
    {
      name: 'Piotr Wiśniewski',
      role: 'Product Manager',
      company: 'Startup Inc',
      content: 'Zaoszczędziliśmy tygodnie pracy dzięki gotowym komponentom i konfiguracji.',
      avatar: undefined
    }
  ]
})
</script>

<template>
  <section class="py-20">
    <UContainer>
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          {{ props.title }}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <UCard
          v-for="(testimonial, index) in props.testimonials"
          :key="index"
          class="h-full"
        >
          <template #header>
            <div class="flex items-center gap-4">
              <UAvatar
                v-if="testimonial.avatar"
                :src="testimonial.avatar"
                :alt="testimonial.name"
                size="md"
              />
              <UAvatar
                v-else
                :alt="testimonial.name"
                size="md"
              >
                {{ testimonial.name.charAt(0) }}
              </UAvatar>
              <div>
                <p class="font-semibold">
                  {{ testimonial.name }}
                </p>
                <p class="text-sm text-muted">
                  {{ testimonial.role }}
                  <span v-if="testimonial.company">, {{ testimonial.company }}</span>
                </p>
              </div>
            </div>
          </template>

          <p class="text-muted">
            "{{ testimonial.content }}"
          </p>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
