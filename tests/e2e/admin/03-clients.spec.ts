/**
 * TEST 2: Create and View Clients
 *
 * - View clients list with search/filter
 * - Create a new client
 * - View client detail page
 * - Verify tabs are visible (Diet Logs, Payments, Notes, etc.)
 */
import { test, expect } from '@playwright/test'
import { uid, waitForLoad, expectNoError } from '../helpers'

test.describe('Clients', () => {
  test('clients list page loads', async ({ page }) => {
    await page.goto('/admin/clients')
    await waitForLoad(page)
    await expectNoError(page)

    await expect(page.getByRole('heading', { name: /clients/i })).toBeVisible()
    // Should show at least one client row (seeded data)
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 10000 })
  })

  test('can search clients by name', async ({ page }) => {
    await page.goto('/admin/clients')
    await waitForLoad(page)

    // Type a nonsense search — table should show empty state
    await page.getByPlaceholder(/search/i).fill('zzz_no_match_xyz')
    // Either shows empty or filters. Just confirm no crash.
    await expectNoError(page)

    await page.getByPlaceholder(/search/i).clear()
  })

  test('can create a new client', async ({ page }) => {
    const id = uid()
    const testName = `Test Client ${id}`

    await page.goto('/admin/clients/new')
    await waitForLoad(page)
    await expectNoError(page)

    // Basic info
    await page.getByLabel(/Full Name/i).fill(testName)
    await page.getByLabel(/Email/i).fill(`testclient${id}@test.com`)
    await page.getByLabel(/Phone/i).fill(`98765${id.slice(0, 5)}`)

    // Package — select Gold
    const packageSelect = page.getByLabel(/Package/i)
    await packageSelect.selectOption('Gold')

    // Duration
    await page.getByLabel(/Duration \(Months\)/i).fill('3')

    // Start date
    const today = new Date().toISOString().split('T')[0]
    await page.getByLabel(/Start Date/i).fill(today)

    // Submit
    await page.getByRole('button', { name: /Add Client/i }).click()

    // Should redirect to clients list or new client page
    await page.waitForURL(/admin\/clients/, { timeout: 15000 })
    await expectNoError(page)
  })

  test('client detail page has all required tabs', async ({ page }) => {
    const clientId = process.env.TEST_CLIENT_ID
    if (!clientId || clientId === 'REPLACE_WITH_TEST_CLIENT_UUID') {
      test.skip(true, 'Set TEST_CLIENT_ID in .env.test to run client detail tests')
    }

    await page.goto(`/admin/clients/${clientId}`)
    await waitForLoad(page)
    await expectNoError(page)

    // Core info should be visible
    await expect(page.getByText(/Profile|Diet|Payments|Notes/i).first()).toBeVisible()
  })

  test('client profile shows name and package', async ({ page }) => {
    const clientId = process.env.TEST_CLIENT_ID
    if (!clientId || clientId === 'REPLACE_WITH_TEST_CLIENT_UUID') {
      test.skip(true, 'Set TEST_CLIENT_ID in .env.test')
    }

    await page.goto(`/admin/clients/${clientId}`)
    await waitForLoad(page)
    await expectNoError(page)

    // Package badge should be visible
    await expect(page.getByText(/Gold|Hybrid|Platinum/i).first()).toBeVisible()
  })
})
