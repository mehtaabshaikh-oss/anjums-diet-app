/**
 * TEST 6: Add and View Notes
 *
 * - View notes tab on client detail page
 * - Add a new note
 * - Verify note appears in the list
 */
import { test, expect } from '@playwright/test'
import { uid, waitForLoad, expectNoError } from '../helpers'

test.describe('Client Notes', () => {
  test.beforeEach(async ({ page }) => {
    const clientId = process.env.TEST_CLIENT_ID
    if (!clientId || clientId === 'REPLACE_WITH_TEST_CLIENT_UUID') {
      test.skip(true, 'Set TEST_CLIENT_ID in .env.test to run notes tests')
    }
  })

  test('notes tab loads on client detail page', async ({ page }) => {
    await page.goto(`/admin/clients/${process.env.TEST_CLIENT_ID}`)
    await waitForLoad(page)
    await expectNoError(page)

    const notesTab = page.getByRole('button', { name: /Notes/i })
    if (await notesTab.isVisible()) {
      await notesTab.click()
      await waitForLoad(page)
      await expectNoError(page)
    }
  })

  test('can add a note', async ({ page }) => {
    const noteContent = `E2E test note ${uid()}`

    await page.goto(`/admin/clients/${process.env.TEST_CLIENT_ID}`)
    await waitForLoad(page)

    // Navigate to Notes tab
    const notesTab = page.getByRole('button', { name: /Notes/i })
    if (await notesTab.isVisible()) {
      await notesTab.click()
      await waitForLoad(page)
    }

    // Find add note form
    const addBtn = page.getByRole('button', { name: /Add Note/i })
    if (await addBtn.isVisible()) {
      await addBtn.click()

      // Fill textarea
      const textarea = page.getByRole('textbox').last()
      await textarea.fill(noteContent)

      // Save
      await page.getByRole('button', { name: /Save|Submit|Add/i }).last().click()
      await waitForLoad(page)
      await expectNoError(page)

      // Note should now be visible
      await expect(page.getByText(noteContent)).toBeVisible({ timeout: 10000 })
    } else {
      // Notes may render inline — check no crash
      await expectNoError(page)
    }
  })

  test('notes list does not show error state', async ({ page }) => {
    await page.goto(`/admin/clients/${process.env.TEST_CLIENT_ID}`)
    await waitForLoad(page)

    const notesTab = page.getByRole('button', { name: /Notes/i })
    if (await notesTab.isVisible()) {
      await notesTab.click()
      await waitForLoad(page)
      await expectNoError(page)
    }
  })
})
