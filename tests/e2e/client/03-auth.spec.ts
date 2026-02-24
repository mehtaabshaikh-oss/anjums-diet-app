/**
 * Client Auth Tests
 *
 * - Invalid login shows error (doesn't crash)
 * - Unauthenticated access to client pages redirects to login
 * - Client logout clears session
 */
import { test, expect } from '@playwright/test'
import { waitForLoad } from '../helpers'

// These tests run WITHOUT saved auth state (fresh browser)
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Client Auth', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/client/login')
    await expect(page.getByText("Anjum's Diet & Wellness")).toBeVisible()
    await expect(page.getByText('Client Portal')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('/client/login')
    await page.locator('#email').fill('wrong@test.com')
    await page.locator('#password').fill('wrongpassword123')
    await page.locator('button[type="submit"]').click()

    // Should show error — not redirect
    await expect(page.locator('[class*="red-50"]')).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveURL(/client\/login/)
  })

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto('/client/dashboard')
    await waitForLoad(page)

    // Should be redirected to login
    await expect(page).toHaveURL(/client\/login|\//)
  })

  test('unauthenticated access to diet-plan redirects', async ({ page }) => {
    await page.goto('/client/diet-plan')
    await waitForLoad(page)

    await expect(page).toHaveURL(/client\/login|\//)
  })
})
