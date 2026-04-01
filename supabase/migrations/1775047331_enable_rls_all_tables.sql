-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Drop conflicting policies
DROP POLICY IF EXISTS "leads_authenticated_read" ON leads;
DROP POLICY IF EXISTS "leads_public_insert" ON leads;
DROP POLICY IF EXISTS "clients_authenticated_read" ON clients;
DROP POLICY IF EXISTS "client_profiles_authenticated_read" ON client_profiles;
DROP POLICY IF EXISTS "weight_logs_authenticated_read" ON weight_logs;
DROP POLICY IF EXISTS "notes_authenticated_read" ON notes;

-- Leads: public insert (contact form), authenticated read
CREATE POLICY "leads_public_insert" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "leads_authenticated_read" ON leads FOR SELECT USING (auth.role() = 'authenticated');

-- Clients: authenticated read/write, admin delete
CREATE POLICY "clients_authenticated_read" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "clients_authenticated_insert" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "clients_authenticated_update" ON clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "clients_admin_delete" ON clients FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Client profiles: authenticated read/write
CREATE POLICY "client_profiles_authenticated_read" ON client_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "client_profiles_authenticated_insert" ON client_profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "client_profiles_authenticated_update" ON client_profiles FOR UPDATE USING (auth.role() = 'authenticated');

-- Weight logs: authenticated read/write
CREATE POLICY "weight_logs_authenticated_read" ON weight_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "weight_logs_authenticated_insert" ON weight_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "weight_logs_authenticated_update" ON weight_logs FOR UPDATE USING (auth.role() = 'authenticated');

-- Payments: admin only
CREATE POLICY "payments_admin_only" ON payments FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Users: admin only
CREATE POLICY "users_admin_only" ON users FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Notes: authenticated read/write, admin delete
CREATE POLICY "notes_authenticated_read" ON notes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "notes_authenticated_insert" ON notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "notes_authenticated_update" ON notes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "notes_admin_delete" ON notes FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
