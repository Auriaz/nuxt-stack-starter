import { expect, test } from '@playwright/test'

test('example e2e test', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Nuxt/)
})
