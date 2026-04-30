-- ═══════════════════════════════════════════════════════════
-- QUICK DRY CLEANING POS — SUPABASE SETUP FOR FIREBASE AUTH
-- Run this ENTIRE script in Supabase SQL Editor
-- This disables RLS so Firebase-authenticated users can 
-- read/write to Supabase tables using the anon key.
-- ═══════════════════════════════════════════════════════════

-- 1. Disable RLS on all tables (Firebase handles auth, not Supabase)
ALTER TABLE IF EXISTS customers          DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders             DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_status_logs  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments           DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications      DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings           DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_logs         DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_audit_logs  DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS otp_rate_limits    DISABLE ROW LEVEL SECURITY;

-- 2. Grant full access to anon role (used by the Supabase JS client)
GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 3. Also grant to authenticated role for completeness
GRANT ALL ON ALL TABLES    IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 4. Drop any old RLS policies that may conflict (safe to run even if they don't exist)
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 5. Verify setup (should show 0 active policies and all tables without RLS)
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
