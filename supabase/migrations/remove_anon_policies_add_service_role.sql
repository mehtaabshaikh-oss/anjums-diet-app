-- ============================================================
-- SECURITY FIX: Remove anon SELECT policies from sensitive tables
-- All API routes now use the service_role key which bypasses
-- RLS entirely. Anon key access to sensitive data is removed.
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Dynamically drop ALL policies that include 'anon' role
-- on sensitive tables (covers any hotfix policy names from last session)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND '{anon}' && roles  -- matches if anon is in the roles array
      AND tablename IN (
        'clients', 'client_profiles', 'diet_plans', 'diet_plan_items',
        'diet_logs', 'diet_log_items', 'weight_logs', 'measurements_logs',
        'payments', 'notes'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    RAISE NOTICE 'Dropped anon policy: % on %', pol.policyname, pol.tablename;
  END LOOP;
END $$;

-- Step 2: Verify - list remaining policies on sensitive tables
-- You should see only 'authenticated' and 'admin' policies after this
SELECT tablename, policyname, roles::text, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'clients', 'client_profiles', 'diet_plans', 'diet_plan_items',
    'diet_logs', 'diet_log_items', 'weight_logs', 'measurements_logs',
    'payments', 'notes'
  )
ORDER BY tablename, cmd;
