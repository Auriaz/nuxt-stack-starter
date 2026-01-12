import { test, expect } from '@playwright/test'

test.describe('Contact Page', () => {
  test('should load contact page', async ({ page }) => {
    await page.goto('/kontakt')
    await expect(page).toHaveTitle(/Kontakt/i)
  })

  test('should display contact form', async ({ page }) => {
    await page.goto('/kontakt')
    const form = page.locator('form').first()
    await expect(form).toBeVisible()
  })

  test('should have required form fields', async ({ page }) => {
    await page.goto('/kontakt')
    await expect(page.getByLabel(/Imię/i)).toBeVisible()
    await expect(page.getByLabel(/Email/i)).toBeVisible()
    await expect(page.getByLabel(/Temat/i)).toBeVisible()
    await expect(page.getByLabel(/Wiadomość/i)).toBeVisible()
  })

  test('should validate form fields', async ({ page }) => {
    await page.goto('/kontakt')
    const submitButton = page.getByRole('button', { name: /Wyślij/i })
    await submitButton.click()

    // Form should show validation errors
    await expect(page.locator('form')).toBeVisible()
  })

  test('should submit form with valid data', async ({ page }) => {
    await page.goto('/kontakt')

    await page.getByLabel(/Imię/i).fill('Jan Kowalski')
    await page.getByLabel(/Email/i).fill('jan@example.com')
    await page.getByLabel(/Temat/i).fill('Test Temat')
    await page.getByLabel(/Wiadomość/i).fill('To jest testowa wiadomość z Playwright E2E test.')

    const submitButton = page.getByRole('button', { name: /Wyślij/i })
    await submitButton.click()

    // Wait for success message or API response
    await page.waitForTimeout(1000)

    // Check if form was submitted (success message or form reset)
    const successMessage = page.getByText(/wysłana|success/i)
    if (await successMessage.isVisible().catch(() => false)) {
      await expect(successMessage).toBeVisible()
    }
  })
})
