-- Emergency fix: Enable RLS on leads and users tables
-- These were missing from previous migrations and causing public access vulnerability

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "leads_public_insert" ON leads;
DROP POLICY IF EXISTS "leads_authenticated_read" ON leads;
DROP POLICY IF EXISTS "users_admin_only" ON users;

-- Leads: Public can submit (contact form), authenticated can read
CREATE POLICY "leads_public_submit" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads_authenticated_read" ON leads FOR SELECT USING (auth.role() = 'authenticated');

-- Users: Admin only access
CREATE POLICY "users_admin_manage" ON users FOR ALL USING (
  auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);
