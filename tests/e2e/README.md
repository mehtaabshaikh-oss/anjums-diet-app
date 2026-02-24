# E2E Tests — Anjum's Diet & Wellness

Playwright end-to-end tests. Run these before every production deploy.

## Setup (one-time)

```bash
# 1. Install dependencies (already done if you ran npm install)
npm install

# 2. Install Playwright browsers
npx playwright install chromium

# 3. Copy and fill in test credentials
cp .env.test .env.test.local   # optional — .env.test is already gitignored
```

Edit `.env.test` and replace the placeholder values:

| Variable | Description |
|---|---|
| `TEST_ADMIN_EMAIL` | Email of admin user in Supabase Auth |
| `TEST_ADMIN_PASSWORD` | Admin password |
| `TEST_STAFF_EMAIL` | Staff user email (optional — skipped if blank) |
| `TEST_STAFF_PASSWORD` | Staff password |
| `TEST_CLIENT_EMAIL` | Email of a test client in the `clients` table |
| `TEST_CLIENT_PASSWORD` | That client's password (must have `password_changed=true`) |
| `TEST_CLIENT_ID` | UUID of that client (from Supabase `clients` table) |

> **Tip:** Create a dedicated test client in the admin panel. Name it "Test Client" so it's easy to identify.

## Running Tests

```bash
# Start dev server first (in a separate terminal)
npm run dev

# Then in another terminal:
npm run test:e2e           # run all tests (headless)
npm run test:e2e:ui        # run with interactive UI (great for debugging)
npm run test:e2e:report    # view last test report in browser
```

Run a specific test file:
```bash
npx playwright test tests/e2e/admin/02-leads.spec.ts
```

Run tests matching a title:
```bash
npx playwright test -g "can create a new lead"
```

## Test Coverage

| # | Test | File |
|---|---|---|
| 1 | Create & View Leads | `admin/02-leads.spec.ts` |
| 2 | Create & View Clients | `admin/03-clients.spec.ts` |
| 3 | Add & View Appointments | `admin/04-appointments.spec.ts` |
| 4 | Add & View Payments | `admin/05-payments.spec.ts` |
| 5 | Add & View Diet Plans | `admin/06-diet-plans.spec.ts` |
| 6 | Add & View Notes | `admin/07-notes.spec.ts` |
| 7 | Add & View Diet Logs (admin) | `admin/08-diet-logs.spec.ts` |
| 8 | Admin Dashboard | `admin/01-dashboard.spec.ts` |
| 9 | Staff Dashboard | `admin/01-dashboard.spec.ts` (staff skip) |
| 10 | Client Dashboard | `client/01-dashboard.spec.ts` |
| 11 | Client View & Submit Diet Plan | `client/02-diet-plan.spec.ts` |
| 12 | Client View Diet Log History | `client/02-diet-plan.spec.ts` |
| 13 | View Diet Logs as Admin | `admin/08-diet-logs.spec.ts` |

**Bonus tests (not in original list):**
- Admin login / invalid credentials / auth redirect — `admin/00-auth.spec.ts`
- Client login / invalid credentials / auth redirect — `client/03-auth.spec.ts`

## Adding New Bug Tests

When a bug is reported and fixed, add a regression test:

1. Create or add to the relevant spec file (e.g., a bug in payments → `admin/05-payments.spec.ts`)
2. Name the test after the bug: `test('BUG: duration shows "Months" instead of number', ...)`
3. The test should fail with the old code and pass with the fix applied

## Known Gaps (to add later)
- Weight logs: Add & view weight history
- Measurements: Add & view body measurements
- Lead → Client conversion flow
- Diet plan activate/archive toggle
- Payment status update (pending → paid)
- Client search/filter on clients list
- Mobile viewport tests
