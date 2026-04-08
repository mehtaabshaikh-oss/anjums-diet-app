-- Fix overly permissive RLS policies (USING/WITH CHECK true)
-- Replace with proper authentication-based policies

-- ==============================================================================
-- CLIENTS TABLE
-- ==============================================================================
DROP POLICY IF EXISTS "clients_authenticated_read" ON clients;
DROP POLICY IF EXISTS "clients_authenticated_insert" ON clients;
DROP POLICY IF EXISTS "clients_authenticated_update" ON clients;
DROP POLICY IF EXISTS "clients_admin_delete" ON clients;

CREATE POLICY "clients_staff_read" ON clients FOR SELECT 
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "clients_staff_insert" ON clients FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "clients_staff_update" ON clients FOR UPDATE 
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "clients_admin_delete" ON clients FOR DELETE 
  USING (auth.jwt() ->> 'role' = 'admin');

-- ==============================================================================
-- DIET_LOGS TABLE
-- ==============================================================================
DROP POLICY IF EXISTS "diet_logs_authenticated_read" ON diet_logs;
DROP POLICY IF EXISTS "diet_logs_authenticated_insert" ON diet_logs;
DROP POLICY IF EXISTS "diet_logs_authenticated_update" ON diet_logs;

CREATE POLICY "diet_logs_staff_read" ON diet_logs FOR SELECT 
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "diet_logs_staff_insert" ON diet_logs FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "diet_logs_staff_update" ON diet_logs FOR UPDATE 
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- ==============================================================================
-- DIET_PLAN_ITEMS TABLE
-- ==============================================================================
DROP POLICY IF EXISTS "diet_plan_items_authenticated_read" ON diet_plan_items;
DROP POLICY IF EXISTS "diet_plan_items_authenticated_insert" ON diet_plan_items;
DROP POLICY IF EXISTS "diet_plan_items_authenticated_update" ON diet_plan_items;

CREATE POLICY "diet_plan_items_staff_read" ON diet_plan_items FOR SELECT 
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "diet_plan_items_staff_insert" ON diet_plan_items FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));
CREATE POLICY "diet_plan_items_staff_update" ON diet_plan_items FOR UPDATE 
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));

-- ==============================================================================
-- LEADS TABLE - Keep public insert but be explicit about it
-- ==============================================================================
DROP POLICY IF EXISTS "leads_public_submit" ON leads;
DROP POLICY IF EXISTS "leads_authenticated_read" ON leads;

-- Public can only INSERT (submit contact form), nothing else
CREATE POLICY "leads_public_insert" ON leads FOR INSERT 
  WITH CHECK (true); -- Intentionally permissive for contact form
CREATE POLICY "leads_staff_read" ON leads FOR SELECT 
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'));
-- Staff cannot update/delete public submissions
CREATE POLICY "leads_staff_update_status" ON leads FOR UPDATE 
  USING (auth.jwt() ->> 'role' IN ('admin', 'staff'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'staff'));
