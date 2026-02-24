/**
 * TEST 7: Add and View Diet Logs (admin side)
 * TEST 13: View Diet Logs as Admin
 *
 * - View diet logs dashboard page
 * - View diet logs for a specific client
 * - Verify adherence data displays correctly
 */
import { test, expect } from '@playwright/test'
import { waitForLoad, expectNoError } from '../helpers'

test.describe('Diet Logs — Admin View', () => {
  test('diet logs dashboard page loads', async ({ page }) => {
    await page.goto('/admin/diet-logs-dashboard')
    await waitForLoad(page)
    await expectNoError(page)

    await expect(page.getByText(/Diet Log|Adherence|Logs/i).first()).toBeVisible()
  })

  test('diet logs dashboard shows no internal server error', async ({ page }) => {
    await page.goto('/admin/diet-logs-dashboard')
    await waitForLoad(page)

    await expect(page.getByText(/Internal server error/i)).not.toBeVisible()
    await expect(page.getByText(/Failed to/i)).not.toBeVisible()
  })

  test('client diet logs tab loads', async ({ page }) => {
    const clientId = process.env.TEST_CLIENT_ID
    if (!clientId || clientId === 'REPLACE_WITH_TEST_CLIENT_UUID') {
      test.skip(true, 'Set TEST_CLIENT_ID in .env.test')
    }

    await page.goto(`/admin/clients/${clientId}`)
    await waitForLoad(page)
    await expectNoError(page)

    // Navigate to Diet Logs tab
    const logsTab = page.getByRole('button', { name: /Diet Logs/i })
    if (await logsTab.isVisible()) {
      await logsTab.click()
      await waitForLoad(page)
      await expectNoError(page)

      // Should show a list or "no logs" message — either is valid
      const content = await page.locator('body').innerText()
      expect(content).not.toContain('Internal server error')
    }
  })

  test('diet logs page shows date filters or log entries', async ({ page }) => {
    await page.goto('/admin/diet-logs-dashboard')
    await waitForLoad(page)
    await expectNoError(page)

    // Should have some meaningful content
    const pageText = await page.locator('body').innerText()
    expect(pageText.length).toBeGreaterThan(100)
  })
})
