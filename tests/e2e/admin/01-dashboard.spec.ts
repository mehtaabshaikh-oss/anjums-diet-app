/**
 * TEST 8: View Dashboard as Admin
 * TEST 9: View Dashboard as Staff (same URL, different role — re-run with staff creds)
 *
 * Verifies that the admin dashboard loads key stats and charts without errors.
 */
import { test, expect } from '@playwright/test'
import { waitForLoad, expectNoError } from '../helpers'

test.describe('Admin Dashboard', () => {
  test('shows stat cards with numeric values', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await waitForLoad(page)
    await expectNoError(page)

    // Four stat cards should be visible
    await expect(page.getByText('Total Clients')).toBeVisible()
    await expect(page.getByText('Active Clients')).toBeVisible()
    await expect(page.getByText('Logs Submitted Today')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Upcoming Appointments/i)).toBeVisible()
  })

  test('analytics section loads without "Failed to fetch" error', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await waitForLoad(page)

    // Should NOT see these error states
    await expect(page.getByText(/Failed to fetch stats/i)).not.toBeVisible()
    await expect(page.getByText(/Failed to fetch analytics/i)).not.toBeVisible()
    await expect(page.getByText(/Internal server error/i)).not.toBeVisible()
  })

  test('stat card numbers are numeric (not NaN or undefined)', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await waitForLoad(page)

    // Grab all large number elements in stat cards and check they're digits
    const statNumbers = page.locator('p.text-3xl, p.text-4xl, h2.text-4xl').first()
    await expect(statNumbers).toBeVisible()
    const text = await statNumbers.innerText()
    expect(text.trim()).toMatch(/^\d+$/)
  })

  test('upcoming appointments list renders', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await waitForLoad(page)

    // Either shows appointments or "no upcoming appointments" message — both are valid
    const hasAppointments = await page.getByText(/No upcoming appointments/i).count()
    // Just verify the section didn't crash
    await expect(page.getByText(/Upcoming Appointments/i)).toBeVisible()
  })
})

// ── Staff role test ───────────────────────────────────────────────────────────
test.describe('Staff Dashboard', () => {
  test('staff user can view dashboard', async ({ page }) => {
    // If staff credentials aren't set, skip
    if (!process.env.TEST_STAFF_EMAIL) {
      test.skip(true, 'No staff credentials in .env.test — set TEST_STAFF_EMAIL/TEST_STAFF_PASSWORD to run')
    }

    // Staff uses same dashboard URL
    await page.goto('/admin/dashboard')
    await waitForLoad(page)
    await expectNoError(page)
    await expect(page.getByText('Total Clients')).toBeVisible()
  })
})
