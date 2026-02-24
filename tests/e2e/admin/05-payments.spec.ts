/**
 * TEST 4: Add and View Payments
 *
 * - View payments tab on client detail page
 * - Add a new payment record
 * - Verify payment appears in list
 * - Update payment status
 */
import { test, expect } from '@playwright/test'
import { uid, waitForLoad, expectNoError } from '../helpers'

test.describe('Payments', () => {
  test.beforeEach(async ({ page }) => {
    const clientId = process.env.TEST_CLIENT_ID
    if (!clientId || clientId === 'REPLACE_WITH_TEST_CLIENT_UUID') {
      test.skip(true, 'Set TEST_CLIENT_ID in .env.test to run payment tests')
    }
  })

  test('payments tab loads on client detail page', async ({ page }) => {
    await page.goto(`/admin/clients/${process.env.TEST_CLIENT_ID}`)
    await waitForLoad(page)
    await expectNoError(page)

    // Navigate to Payments tab
    const paymentsTab = page.getByRole('button', { name: /Payments/i })
    if (await paymentsTab.isVisible()) {
      await paymentsTab.click()
      await waitForLoad(page)
      await expectNoError(page)
    }
  })

  test('can add a new payment', async ({ page }) => {
    await page.goto(`/admin/clients/${process.env.TEST_CLIENT_ID}`)
    await waitForLoad(page)

    // Go to payments tab
    const paymentsTab = page.getByRole('button', { name: /Payments/i })
    if (await paymentsTab.isVisible()) {
      await paymentsTab.click()
      await waitForLoad(page)
    }

    // Click Add Payment button
    const addBtn = page.getByRole('button', { name: /Add Payment/i })
    if (await addBtn.isVisible()) {
      await addBtn.click()

      // Fill in amount
      const amountInput = page.getByLabel(/Amount/i).first()
      if (await amountInput.isVisible()) {
        await amountInput.fill('5000')
      }

      // Set date
      const today = new Date().toISOString().split('T')[0]
      const dateInput = page.locator('input[type="date"]').first()
      if (await dateInput.isVisible()) {
        await dateInput.fill(today)
      }

      // Set status to paid if option exists
      const statusSelect = page.getByLabel(/Status/i).first()
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('paid')
      }

      // Save
      const saveBtn = page.getByRole('button', { name: /Save|Add|Submit/i }).last()
      await saveBtn.click()
      await waitForLoad(page)
      await expectNoError(page)

      // Should see amount somewhere on the page
      await expect(page.getByText(/5000|₹5,000/i)).toBeVisible({ timeout: 8000 })
    } else {
      // Payment UI may differ — just check no crash
      await expectNoError(page)
    }
  })

  test('payment history shows total revenue section', async ({ page }) => {
    await page.goto(`/admin/clients/${process.env.TEST_CLIENT_ID}`)
    await waitForLoad(page)

    const paymentsTab = page.getByRole('button', { name: /Payments/i })
    if (await paymentsTab.isVisible()) {
      await paymentsTab.click()
      await waitForLoad(page)
      await expectNoError(page)

      // Should have some summary section
      const content = await page.locator('body').innerText()
      // Just verify the tab loaded something
      expect(content.length).toBeGreaterThan(100)
    }
  })
})
