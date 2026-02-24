/**
 * Admin Auth Tests
 *
 * - Invalid login shows error
 * - Unauthenticated access redirects to login
 * - These tests run WITHOUT saved auth state (fresh browser)
 */
import { test, expect } from '@playwright/test'
import { waitForLoad } from '../helpers'

// Run these without the saved admin auth state
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Admin Auth', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.getByText("Anjum's Diet & Wellness")).toBeVisible()
    await expect(page.getByText('Admin Portal')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('invalid credentials show error message', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('#email').fill('notanadmin@test.com')
    await page.locator('#password').fill('wrongpassword123')
    await page.locator('button[type="submit"]').click()

    // Should show error, not redirect
    await expect(page.locator('[class*="red-50"]')).toBeVisible({ timeout: 15000 })
    await expect(page).toHaveURL(/admin\/login/)
  })

  test('unauthenticated access to dashboard redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await waitForLoad(page)

    await expect(page).toHaveURL(/admin\/login/)
  })

  test('unauthenticated access to clients page redirects to login', async ({ page }) => {
    await page.goto('/admin/clients')
    await waitForLoad(page)

    await expect(page).toHaveURL(/admin\/login/)
  })
})
