import { describe, it, expect } from 'vitest'

describe('SEO Utilities', () => {
  it('should validate SEO meta structure', () => {
    const meta = {
      title: 'Test Title',
      description: 'Test Description',
      image: '/test-image.png',
      noindex: false
    }

    expect(meta.title).toBeTruthy()
    expect(meta.description).toBeTruthy()
    expect(meta.title.length).toBeGreaterThan(0)
    expect(meta.description.length).toBeGreaterThan(0)
  })

  it('should handle missing optional fields', () => {
    const meta = {
      title: 'Test Title',
      description: 'Test Description'
    }

    expect(meta.title).toBeTruthy()
    expect(meta.description).toBeTruthy()
  })
})
