/**
 * Admin auth setup — runs once before all admin tests.
 * Logs in as admin via the UI and saves browser storage state
 * so all admin tests start already authenticated.
 */
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.auth/admin.json')

setup('admin login', async ({ page }) => {
  const email = process.env.TEST_ADMIN_EMAIL
  const password = process.env.TEST_ADMIN_PASSWORD

  if (!email || !password || password === 'REPLACE_WITH_ADMIN_PASSWORD') {
    throw new Error(
      'Missing admin credentials. Fill in TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD in .env.test'
    )
  }

  await page.goto('/admin/login')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.locator('button[type="submit"]').click()

  // Wait for redirect to dashboard
  await page.waitForURL('**/admin/dashboard', { timeout: 20000 })
  await expect(page).toHaveURL(/admin\/dashboard/)

  // Save storage state (Supabase auth cookies/localStorage)
  await page.context().storageState({ path: authFile })
  console.log('✓ Admin auth state saved')
})
