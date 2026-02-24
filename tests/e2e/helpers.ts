/**
 * Shared test helpers for E2E tests.
 */
import { Page, expect } from '@playwright/test'

/** Unique suffix for test data — avoids collisions between runs */
export const uid = () => Date.now().toString().slice(-6)

/** Wait for a page to stop showing a loading spinner/skeleton */
export async function waitForLoad(page: Page) {
  // Wait for network to settle
  await page.waitForLoadState('networkidle')
}

/**
 * Assert that the page shows no error banner.
 * Error divs in this app use classes containing "red" or text "error"/"failed".
 */
export async function expectNoError(page: Page) {
  const errorBanner = page.locator(
    '[class*="red-50"], [class*="red-100"], [class*="red-700"]'
  ).first()
  // Only fail if the error banner is visible AND contains error text
  const count = await errorBanner.count()
  if (count > 0) {
    const text = await errorBanner.innerText().catch(() => '')
    if (text.toLowerCase().includes('error') || text.toLowerCase().includes('failed')) {
      throw new Error(`Unexpected error on page: "${text}"`)
    }
  }
}

/**
 * Navigate to a client's detail page tab.
 * Tab labels: 'Diet Logs' | 'Payments' | 'Notes' | 'Diet Plan' | 'Appointments' | 'Measurements' | 'Weight'
 */
export async function goToClientTab(page: Page, clientId: string, tabLabel: string) {
  await page.goto(`/admin/clients/${clientId}`)
  await waitForLoad(page)
  await page.getByRole('button', { name: tabLabel }).click()
  await waitForLoad(page)
}

/** Fill the admin login form — used when session expires mid-test */
export async function adminLogin(page: Page) {
  await page.goto('/admin/login')
  await page.locator('#email').fill(process.env.TEST_ADMIN_EMAIL!)
  await page.locator('#password').fill(process.env.TEST_ADMIN_PASSWORD!)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL('**/admin/dashboard', { timeout: 20000 })
}
