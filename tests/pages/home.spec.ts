import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Nuxt Base Starter/i)
  })
})
