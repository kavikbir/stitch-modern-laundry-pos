-- SUPABASE SECURITY SETUP (FIXED FOR UUID/TEXT)
-- Run this in your Supabase SQL Editor to secure your database.

-- 1. Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 2. CUSTOMERS TABLE POLICIES
-- Allow everyone to create their own profile during signup
DROP POLICY IF EXISTS "Allow individual signup" ON customers;
CREATE POLICY "Allow individual signup" ON customers 
FOR INSERT WITH CHECK (true);

-- Users can only see and update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON customers;
CREATE POLICY "Users can view own profile" ON customers 
FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update own profile" ON customers;
CREATE POLICY "Users can update own profile" ON customers 
FOR UPDATE USING (auth.uid()::text = id);

-- 3. ORDERS TABLE POLICIES
-- Users can only see their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders 
FOR SELECT USING (auth.uid()::text = customer_id);

-- Users can create their own orders
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders" ON orders 
FOR INSERT WITH CHECK (auth.uid()::text = customer_id);

-- 4. ADMIN POLICIES (Access for Admins/Staff)
-- SECURITY DEFINER function to avoid RLS recursion
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.customers 
    WHERE id = auth.uid()::text 
    AND role IN ('admin', 'manager')
    AND is_deleted = false
  );
$$ LANGUAGE sql SECURITY DEFINER;

DROP POLICY IF EXISTS "Admins have full access to customers" ON customers;
CREATE POLICY "Admins have full access to customers" ON customers FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;
CREATE POLICY "Admins have full access to orders" ON orders FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access to settings" ON settings;
CREATE POLICY "Admins have full access to settings" ON settings FOR ALL USING (is_admin());

-- 5. SETTINGS TABLE (Public View)
DROP POLICY IF EXISTS "Allow anyone to view business settings" ON settings;
CREATE POLICY "Allow anyone to view business settings" ON settings 
FOR SELECT USING (true);
