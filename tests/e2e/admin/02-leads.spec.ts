/**
 * TEST 1: Create and View Leads
 *
 * - View the leads list (stat cards, table)
 * - Create a new lead via the form
 * - Verify it appears in the list
 * - Update lead status
 * - Add a note to a lead
 */
import { test, expect } from '@playwright/test'
import { uid, waitForLoad, expectNoError } from '../helpers'

test.describe('Leads', () => {
  test('leads page loads with stats', async ({ page }) => {
    await page.goto('/admin/leads')
    await waitForLoad(page)
    await expectNoError(page)

    await expect(page.getByText('Total Leads')).toBeVisible()
    await expect(page.getByText('New Leads')).toBeVisible()
    await expect(page.getByText('Conversion Rate')).toBeVisible()
    await expect(page.getByText('Contacted')).toBeVisible()
  })

  test('can create a new lead', async ({ page }) => {
    const testName = `Test Lead ${uid()}`

    await page.goto('/admin/leads')
    await waitForLoad(page)

    // Open create form
    await page.getByRole('button', { name: '+ Add Lead' }).click()
    await expect(page.getByText('Create New Lead')).toBeVisible()

    // Fill form
    await page.getByPlaceholder('Lead name').fill(testName)
    await page.getByPlaceholder('email@example.com').fill(`testlead_${uid()}@test.com`)
    await page.getByPlaceholder('+91 XXXXX XXXXX').fill('9876543210')
    await page.getByPlaceholder('Lead inquiry or notes...').fill('Interested in Gold package')

    // Submit
    await page.getByRole('button', { name: 'Create Lead' }).click()

    // Form should close and lead should appear in table
    await expect(page.getByText('Create New Lead')).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByText(testName)).toBeVisible({ timeout: 10000 })
  })

  test('can click a lead to view details panel', async ({ page }) => {
    await page.goto('/admin/leads')
    await waitForLoad(page)

    // Click first row in table
    const firstRow = page.locator('tbody tr').first()
    await firstRow.click()

    // Details panel should appear
    await expect(page.getByText('Lead Details')).toBeVisible()
    await expect(page.getByText('Update Status')).toBeVisible()
  })

  test('can update lead status to Contacted', async ({ page }) => {
    await page.goto('/admin/leads')
    await waitForLoad(page)

    // Open first lead's detail panel
    await page.locator('tbody tr').first().click()
    await expect(page.getByText('Lead Details')).toBeVisible()

    // Click Contacted status button
    await page.getByRole('button', { name: 'Contacted' }).click()

    // Status badge in panel should update (no error)
    await expectNoError(page)
  })

  test('can add a note to a lead', async ({ page }) => {
    const noteText = `Test note ${uid()}`

    await page.goto('/admin/leads')
    await waitForLoad(page)

    await page.locator('tbody tr').first().click()
    await expect(page.getByText('Lead Details')).toBeVisible()

    await page.getByText('+ Add Note').click()
    await page.getByPlaceholder('Add internal notes about this lead...').fill(noteText)
    await page.getByRole('button', { name: 'Save Note' }).click()

    // Note should appear
    await expect(page.getByText(noteText)).toBeVisible({ timeout: 8000 })
  })

  test('search filter narrows leads list', async ({ page }) => {
    await page.goto('/admin/leads')
    await waitForLoad(page)

    // Type something unlikely to match
    await page.getByPlaceholder('Search by name, email, or phone...').fill('zzz_no_match_xyz')
    await expect(page.getByText('No leads found matching your filters.')).toBeVisible()

    // Clear search
    await page.getByPlaceholder('Search by name, email, or phone...').clear()
  })
})
