/**
 * Client auth setup — runs once before all client tests.
 * Logs in as a test client via the UI and saves localStorage state.
 */
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.auth/client.json')

setup('client login', async ({ page }) => {
  const email = process.env.TEST_CLIENT_EMAIL
  const password = process.env.TEST_CLIENT_PASSWORD

  if (!email || !password || email === 'REPLACE_WITH_TEST_CLIENT_EMAIL') {
    throw new Error(
      'Missing client credentials. Fill in TEST_CLIENT_EMAIL and TEST_CLIENT_PASSWORD in .env.test'
    )
  }

  await page.goto('/client/login')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.locator('button[type="submit"]').click()

  // Client login redirects to dashboard (unless password needs changing)
  await page.waitForURL('**/client/dashboard', { timeout: 20000 })
  await expect(page).toHaveURL(/client\/dashboard/)

  // Save storage state (includes localStorage with client_id, client_name, client_email)
  await page.context().storageState({ path: authFile })
  console.log('✓ Client auth state saved')
})
