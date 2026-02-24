import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.test') })

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential to avoid DB conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // ── Auth setup runs first ──────────────────────────────────
    {
      name: 'admin-setup',
      testMatch: /setup\/admin\.setup\.ts/,
    },
    {
      name: 'client-setup',
      testMatch: /setup\/client\.setup\.ts/,
    },

    // ── Admin tests (require admin auth state) ─────────────────
    {
      name: 'admin',
      testMatch: /admin\/.*\.spec\.ts/,
      dependencies: ['admin-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
    },

    // ── Client tests (require client auth state) ────────────────
    {
      name: 'client',
      testMatch: /client\/.*\.spec\.ts/,
      dependencies: ['client-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/client.json',
      },
    },
  ],
})
