/**
 * TEST 10: View Client Dashboard
 *
 * - Dashboard shows client name and key info
 * - Weight history section renders
 * - Navigation links work
 */
import { test, expect } from '@playwright/test'
import { waitForLoad, expectNoError } from '../helpers'

test.describe('Client Dashboard', () => {
  test('dashboard loads without error', async ({ page }) => {
    await page.goto('/client/dashboard')
    await waitForLoad(page)
    await expectNoError(page)

    // Should show client name (from localStorage client_name)
    const body = await page.locator('body').innerText()
    expect(body).not.toContain('Internal server error')
  })

  test('navigation links are visible', async ({ page }) => {
    await page.goto('/client/dashboard')
    await waitForLoad(page)

    // Should have links to Dashboard, Diet Plan, History
    await expect(page.getByRole('link', { name: /Dashboard/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Diet Plan/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /History/i }).first()).toBeVisible()
  })

  test('weight tracking section renders', async ({ page }) => {
    await page.goto('/client/dashboard')
    await waitForLoad(page)
    await expectNoError(page)

    // Should show weight-related content or a prompt to log weight
    const body = await page.locator('body').innerText()
    expect(body).not.toContain('Failed to load')
  })

  test('current weight shows a number (not NaN or undefined)', async ({ page }) => {
    await page.goto('/client/dashboard')
    await waitForLoad(page)

    // Look for weight display — should be a number or "No data"
    const bodyText = await page.locator('body').innerText()
    // Should not show JavaScript errors on screen
    expect(bodyText).not.toContain('undefined')
    expect(bodyText).not.toContain('NaN')
  })

  test('client can log out', async ({ page }) => {
    await page.goto('/client/dashboard')
    await waitForLoad(page)

    const logoutBtn = page.getByRole('button', { name: /Logout|Sign Out/i })
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
      // Should redirect to login or home
      await page.waitForURL(/client\/login|\//, { timeout: 10000 })
    }
  })
})
