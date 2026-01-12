import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

// Mock komponentu Hero (uproszczony)
const HeroComponent = defineComponent({
  props: {
    title: {
      type: String,
      default: 'Default Title',
    },
    description: {
      type: String,
      default: 'Default Description',
    },
  },
  template: `
    <section>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </section>
  `,
})

describe('Hero Component', () => {
  it('should render with default props', () => {
    const wrapper = mount(HeroComponent)
    expect(wrapper.text()).toContain('Default Title')
    expect(wrapper.text()).toContain('Default Description')
  })

  it('should render with custom props', () => {
    const wrapper = mount(HeroComponent, {
      props: {
        title: 'Custom Title',
        description: 'Custom Description',
      },
    })
    expect(wrapper.text()).toContain('Custom Title')
    expect(wrapper.text()).toContain('Custom Description')
  })

  it('should have correct structure', () => {
    const wrapper = mount(HeroComponent)
    expect(wrapper.find('section').exists()).toBe(true)
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
  })
})
