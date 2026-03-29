-- ==============================================================================
-- 1. DROP EXISTING CONSTRAINTS AND ADD CASCADING DELETES
-- ==============================================================================

-- client_profiles
ALTER TABLE client_profiles DROP CONSTRAINT IF EXISTS client_profiles_client_id_fkey;
ALTER TABLE client_profiles ADD CONSTRAINT client_profiles_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;



-- payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_client_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- weight_logs
ALTER TABLE weight_logs DROP CONSTRAINT IF EXISTS weight_logs_client_id_fkey;
ALTER TABLE weight_logs ADD CONSTRAINT weight_logs_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- measurements_logs
ALTER TABLE measurements_logs DROP CONSTRAINT IF EXISTS measurements_logs_client_id_fkey;
ALTER TABLE measurements_logs ADD CONSTRAINT measurements_logs_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- notes
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_client_id_fkey;
ALTER TABLE notes ADD CONSTRAINT notes_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- diet_logs
ALTER TABLE diet_logs DROP CONSTRAINT IF EXISTS diet_logs_client_id_fkey;
ALTER TABLE diet_logs ADD CONSTRAINT diet_logs_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- diet_plans cascading
ALTER TABLE diet_plans DROP CONSTRAINT IF EXISTS diet_plans_client_id_fkey;
ALTER TABLE diet_plans ADD CONSTRAINT diet_plans_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- diet_plan_items nested cascading
ALTER TABLE diet_plan_items DROP CONSTRAINT IF EXISTS diet_plan_items_diet_plan_id_fkey;
ALTER TABLE diet_plan_items ADD CONSTRAINT diet_plan_items_diet_plan_id_fkey 
  FOREIGN KEY (diet_plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE;


-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ==============================================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. APPLY EXPLICIT RLS POLICIES (Clinical = Staff/Admin | Financial = Admin Only)
-- ==============================================================================

-- Clients
DROP POLICY IF EXISTS "staff_admin_clients" ON clients;
CREATE POLICY "staff_admin_clients" ON clients FOR ALL USING (auth.jwt() ->> 'role' IN ('staff', 'admin'));

-- Client Profiles
DROP POLICY IF EXISTS "staff_admin_client_profiles" ON client_profiles;
CREATE POLICY "staff_admin_client_profiles" ON client_profiles FOR ALL USING (auth.jwt() ->> 'role' IN ('staff', 'admin'));



-- Weight Logs
DROP POLICY IF EXISTS "staff_admin_weight_logs" ON weight_logs;
CREATE POLICY "staff_admin_weight_logs" ON weight_logs FOR ALL USING (auth.jwt() ->> 'role' IN ('staff', 'admin'));

-- Measurements Logs
DROP POLICY IF EXISTS "staff_admin_measurements_logs" ON measurements_logs;
CREATE POLICY "staff_admin_measurements_logs" ON measurements_logs FOR ALL USING (auth.jwt() ->> 'role' IN ('staff', 'admin'));

-- Notes
DROP POLICY IF EXISTS "staff_admin_notes" ON notes;
CREATE POLICY "staff_admin_notes" ON notes FOR ALL USING (auth.jwt() ->> 'role' IN ('staff', 'admin'));

-- Diet Logs
DROP POLICY IF EXISTS "staff_admin_diet_logs" ON diet_logs;
CREATE POLICY "staff_admin_diet_logs" ON diet_logs FOR ALL USING (auth.jwt() ->> 'role' IN ('staff', 'admin'));

-- Diet Plans
DROP POLICY IF EXISTS "staff_admin_diet_plans" ON diet_plans;
CREATE POLICY "staff_admin_diet_plans" ON diet_plans FOR ALL USING (auth.jwt() ->> 'role' IN ('staff', 'admin'));

-- Diet Plan Items
DROP POLICY IF EXISTS "staff_admin_diet_plan_items" ON diet_plan_items;
CREATE POLICY "staff_admin_diet_plan_items" ON diet_plan_items FOR ALL USING (auth.jwt() ->> 'role' IN ('staff', 'admin'));

-- Payments (Strict Admin Only)
DROP POLICY IF EXISTS "admin_only_payments" ON payments;
CREATE POLICY "admin_only_payments" ON payments FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
